/* Canvas arrows at sampled native ROMS points. East/north velocities in m/s. */
(function (root) {
  'use strict';
  root.loadVectorColors = function (source, field, palette) {
    return new Promise(function (resolve, reject) {
      // Palette-only requests do not depend on the selected grid's WMS support.
      var url = new URL('/thredds/wms/CBOFS/fmrc/Aggregated_7_day_CBOFS_Fields_Forecast_best.ncd', location.origin);
      url.search = new URLSearchParams({request:'GetLegendGraphic', colorbaronly:'true',
        palette:palette, width:256, height:1, vertical:'false'}).toString();
      var img = new Image();
      img.onload = function () {
        var canvas = document.createElement('canvas'); canvas.width=256; canvas.height=1;
        var ctx=canvas.getContext('2d'); ctx.drawImage(img,0,0,256,1);
        resolve({pixels:ctx.getImageData(0,0,256,1).data, url:url.href});
      };
      img.onerror = function () { reject(new Error('Could not load the vector colormap.')); };
      img.src=url.href;
    });
  };
  root.createVectorArrows = function (data, colors, opacity) {
    var maximum = Math.max(0.1, Math.ceil(data.maxSpeed * 10) / 10);
    var ArrowLayer = (L.Layer || L.Class).extend({
      initialize: function () { this.options={opacity:opacity}; this.data=data; this.maximum=maximum; },
      onAdd: function (map) {
        this._map=map;
        this.canvas=L.DomUtil.create('canvas','model-vector-arrows');
        this.canvas.style.cssText='position:absolute;pointer-events:none;';
        map.getPanes().overlayPane.appendChild(this.canvas);
        map.on('moveend zoomend resize',this.draw,this);
        this.draw();
      },
      onRemove: function (map) {
        map.off('moveend zoomend resize',this.draw,this);
        this.canvas.remove(); this._map=null;
      },
      addTo: function (map) { map.addLayer(this); return this; },
      setColors: function (next) {colors=next;this.draw();},
      setOpacity: function (value) {
        this.options.opacity=value;
        if (this.canvas) this.canvas.style.opacity=value;
        return this;
      },
      draw: function () {
        if (!this._map) return;
        var map=this._map, size=map.getSize(), ratio=window.devicePixelRatio || 1;
        var origin=map.containerPointToLayerPoint([0,0]);
        L.DomUtil.setPosition(this.canvas,origin);
        this.canvas.width=size.x*ratio; this.canvas.height=size.y*ratio;
        this.canvas.style.width=size.x+'px'; this.canvas.style.height=size.y+'px';
        this.canvas.style.opacity=this.options.opacity;
        var ctx=this.canvas.getContext('2d'); ctx.scale(ratio,ratio);
        ctx.lineWidth=1.6; ctx.lineCap='round';
        var occupied=new Set(), drawn=0;
        data.points.forEach(function (p) {
          var pt=map.latLngToContainerPoint([p[0],p[1]]);
          if (pt.x<0 || pt.y<0 || pt.x>size.x || pt.y>size.y) return;
          var key=Math.floor(pt.x/24)+','+Math.floor(pt.y/24);
          if (occupied.has(key)) return;
          occupied.add(key);
          var speed=p[4], color=Math.min(255,Math.round(255*speed/maximum))*4;
          ctx.strokeStyle=ctx.fillStyle='rgb('+colors.pixels[color]+','+colors.pixels[color+1]+','+colors.pixels[color+2]+')';
          // Mercator is locally conformal: east is screen-right, north screen-up.
          var dx=48*p[2]/maximum, dy=-48*p[3]/maximum;
          var length=Math.hypot(dx,dy);
          if (length<0.5) { ctx.fillRect(pt.x,pt.y,1.5,1.5); drawn++; return; }
          var startX=pt.x-dx/2, startY=pt.y-dy/2, endX=pt.x+dx/2, endY=pt.y+dy/2;
          var ux=dx/length, uy=dy/length, head=Math.min(7,length*0.35);
          ctx.beginPath();ctx.moveTo(startX,startY);ctx.lineTo(endX,endY);
          ctx.moveTo(endX-head*ux-head*0.5*uy,endY-head*uy+head*0.5*ux);
          ctx.lineTo(endX,endY);ctx.lineTo(endX-head*ux+head*0.5*uy,endY-head*uy-head*0.5*ux);
          ctx.stroke();drawn++;
        });
        this.canvas.dataset.arrowCount=drawn;
      }
    });
    return new ArrowLayer();
  };
}(window));
