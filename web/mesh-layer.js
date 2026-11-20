/* Render native mesh connectivity; interpolate scalar values within wet triangles. */
(function(root){
  'use strict';
  root.createMeshLayer=function(data,colors,range,opacity){
    var vertices=new Float32Array(data.nodes.length*3);
    data.nodes.forEach(function(p,i){
      var latitude=p[1]*Math.PI/180;
      vertices[i*3]=(p[0]+180)/360;
      vertices[i*3+1]=(1-Math.log(Math.tan(latitude)+1/Math.cos(latitude))/Math.PI)/2;
      vertices[i*3+2]=p[2];
    });
    var Layer=(L.Layer||L.Class).extend({
      initialize:function(){this.options={opacity:opacity};this.data=data;},
      onAdd:function(map){
        this._map=map;this.canvas=L.DomUtil.create('canvas','model-scalar-mesh');
        this.canvas.style.cssText='position:absolute;pointer-events:none;';
        var gl=this.canvas.getContext('webgl',{alpha:true,premultipliedAlpha:false,preserveDrawingBuffer:true});
        if(!gl)throw Error('This browser needs WebGL to display the native model mesh.');
        this.gl=gl;
        function shader(type,source){var s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
        var vs=shader(gl.VERTEX_SHADER,'attribute vec3 point; uniform vec2 origin; uniform vec2 size; uniform float scale; varying float value; void main(){vec2 p=(point.xy-origin)*scale;gl_Position=vec4(2.0*p.x/size.x-1.0,1.0-2.0*p.y/size.y,0,1);value=point.z;}');
        var fs=shader(gl.FRAGMENT_SHADER,'precision mediump float; varying float value; uniform vec2 limits; uniform sampler2D palette; void main(){float t=clamp((value-limits.x)/(limits.y-limits.x),0.0,1.0);gl_FragColor=texture2D(palette,vec2(t,0.5));}');
        var program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
        if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
        gl.useProgram(program);this.program=program;
        var buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STATIC_DRAW);
        var point=gl.getAttribLocation(program,'point');gl.enableVertexAttribArray(point);gl.vertexAttribPointer(point,3,gl.FLOAT,false,0,0);
        if(!gl.getExtension('OES_element_index_uint'))throw Error('32-bit mesh indices are not supported by this browser.');
        var indices=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indices);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint32Array(data.triangles),gl.STATIC_DRAW);
        var texture=gl.createTexture();this.texture=texture;gl.bindTexture(gl.TEXTURE_2D,texture);
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,256,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array(colors.pixels));
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
        gl.uniform2f(gl.getUniformLocation(program,'limits'),Number(range.split(',')[0]),Number(range.split(',')[1]));
        gl.disable(gl.DEPTH_TEST);gl.disable(gl.CULL_FACE);
        map.getPanes().overlayPane.appendChild(this.canvas);map.on('moveend zoomend resize',this.draw,this);this.draw();
      },
      onRemove:function(map){map.off('moveend zoomend resize',this.draw,this);this.canvas.remove();var extension=this.gl.getExtension('WEBGL_lose_context');if(extension)extension.loseContext();this._map=null;},
      addTo:function(map){map.addLayer(this);return this;},
      setColors:function(next){var gl=this.gl;gl.bindTexture(gl.TEXTURE_2D,this.texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,256,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array(next.pixels));this.draw();},
      setOpacity:function(value){this.options.opacity=value;if(this.canvas)this.canvas.style.opacity=value;return this;},
      draw:function(){
        if(!this._map)return;
        var map=this._map,size=map.getSize(),ratio=window.devicePixelRatio||1;
        var top=map.containerPointToLayerPoint([0,0]);L.DomUtil.setPosition(this.canvas,top);
        this.canvas.width=Math.round(size.x*ratio);this.canvas.height=Math.round(size.y*ratio);
        this.canvas.style.width=size.x+'px';this.canvas.style.height=size.y+'px';this.canvas.style.opacity=this.options.opacity;
        var scale=map.options.crs.scale(map.getZoom()),corner=map.project(map.containerPointToLatLng([0,0]),map.getZoom());
        var gl=this.gl;gl.viewport(0,0,this.canvas.width,this.canvas.height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform2f(gl.getUniformLocation(this.program,'origin'),corner.x/scale,corner.y/scale);
        gl.uniform2f(gl.getUniformLocation(this.program,'size'),size.x,size.y);gl.uniform1f(gl.getUniformLocation(this.program,'scale'),scale);
        gl.drawElements(gl.TRIANGLES,data.triangles.length,gl.UNSIGNED_INT,0);
        this.canvas.dataset.triangleCount=data.triangles.length/3;
      }
    });
    return new Layer();
  };
}(window));
