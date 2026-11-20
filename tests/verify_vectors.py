"""Check rotation math and live wind/current rendering in headless Edge."""
from pathlib import Path
import json
import math
import re
import subprocess
import tempfile
import threading
import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'src'))
from preview_server import Handler, make_server
from vector_data import rotate, ascii_arrays, clean

for u, v, angle, expected in [(1,0,0,(1,0)), (1,0,math.pi/2,(0,1)), (0,1,math.pi/2,(-1,0)), (3,4,0.7,None)]:
    east, north = rotate(u,v,angle)
    assert math.isclose(math.hypot(east,north), math.hypot(u,v))
    if expected:
        assert all(math.isclose(a,b,abs_tol=1e-12) for a,b in zip((east,north),expected))
assert math.isnan(clean([1e37], {'_FillValue':'1e37'})[0])
try:
    ascii_arrays('Dataset { Float64 a[x = 2]; } x;\n---------------------------------------------\na[2]\n1\n')
    raise AssertionError('Truncated data accepted')
except ValueError:
    pass

Handler.log_message = lambda *args: None
root = Path(__file__).resolve().parents[1] / 'web'
output = Path(__file__).resolve().parents[1] / 'reports' / 'latest'
output.mkdir(parents=True, exist_ok=True)
check = r'''
<pre id="vector-result">RUNNING</pre>
<script>
(async function () {
  var result={checks:[],errors:[]};
  try {
    var model=document.querySelector('[aria-label="OFS model"]');
    var field=document.querySelector('[aria-label="Model field"]');
    var palette=document.querySelector('[aria-label="Field colormap"]');
    var opacity=document.querySelector('[aria-label="Model layer opacity"]');
    var box=model.closest('.leaflet-bar');
    var views={CBOFS:[37.8,-76.2],CIOFS:[60,-152],DBOFS:[39,-75.2],GOMOFS:[43,-69],TBOFS:[27.8,-82.6]};
    for (var system of Object.keys(views)) {
      model.value=system; model.onchange();map.setView(views[system],8,{animate:false});
      for (var type of ['currents','wind']) {
        field.value=type;palette.value='psu-viridis';
        await box.querySelector('button').onclick();
        var canvas=document.querySelector('.model-vector-arrows');
        if(!canvas) throw Error(system+' '+type+': '+box.querySelector('[role=status]').textContent);
        var layer;map.eachLayer(function(l){if(l.canvas===canvas)layer=l;});
        var visible=Number(canvas.dataset.arrowCount);
        if(!visible)throw Error('No visible arrows');
        if(document.querySelector('img.leaflet-tile[src*="/thredds/wms/"]'))throw Error('Vector field has raster tiles');
        if(!layer.data.points.every(p=>Math.abs(Math.hypot(p[2],p[3])-p[4])<1e-8))throw Error('Speed mismatch');
        opacity.value=35;opacity.oninput();
        if(canvas.style.opacity!=='0.35')throw Error('Opacity failed');
        var before=canvas.dataset.arrowCount;map.setZoom(9,{animate:false});
        if(!Number(canvas.dataset.arrowCount))throw Error('Zoom redraw failed');
        map.setZoom(8,{animate:false});
        result.checks.push({model:system,field:type,visibleArrows:visible,points:layer.data.points.length,maxSpeed:layer.data.maxSpeed,time:layer.data.time});
      }
    }
    // Check actual renderer geometry and color with synthetic east/north vectors.
    model.onchange();map.setView([0,0],8,{animate:false});
    var colors={pixels:new Uint8ClampedArray(1024)};
    for(var i=0;i<256;i++){colors.pixels[i*4]=i;colors.pixels[i*4+2]=255-i;}
    var synthetic=createVectorArrows({maxSpeed:2,points:[[0,-1,1,0,1],[0,1,0,2,2]]},colors,1).addTo(map);
    var ctx=synthetic.canvas.getContext('2d'), paths=[], path=[];
    var oldMove=ctx.moveTo.bind(ctx),oldLine=ctx.lineTo.bind(ctx),oldStroke=ctx.stroke.bind(ctx);
    ctx.moveTo=function(x,y){path.push(['M',x,y]);oldMove(x,y);};
    ctx.lineTo=function(x,y){path.push(['L',x,y]);oldLine(x,y);};
    ctx.stroke=function(){paths.push({path:path,color:ctx.strokeStyle});path=[];oldStroke();};
    synthetic.draw();
    if(paths.length!==2)throw Error('Synthetic arrows missing');
    var first=paths[0].path,second=paths[1].path;
    if(Math.abs(first[1][1]-first[0][1]-24)>1e-6 || first[1][2]!==first[0][2])throw Error('East arrow incorrect');
    if(Math.abs(second[1][2]-second[0][2]+48)>1e-6 || second[1][1]!==second[0][1])throw Error('North arrow incorrect');
    if(paths[0].color===paths[1].color)throw Error('Magnitude colors identical');
    map.removeLayer(synthetic);result.geometry='PASS: east/right, north/up, lengths 24/48, different speed colors';
    model.value='CBOFS';model.onchange();map.setView(views.CBOFS,9,{animate:false});
    field.value='currents';palette.value='psu-inferno';await box.querySelector('button').onclick();
    if(!document.querySelector('.model-vector-arrows'))throw Error('Inferno reload failed');
    result.paletteSwitch=true;
    field.value='temp';await field.onchange();
    if(document.querySelector('.model-vector-arrows'))throw Error('Arrow layer not removed on scalar switch');
    field.value='currents';await field.onchange();
    if(!document.querySelector('.model-vector-arrows'))throw Error('Return to vectors failed');
    result.scalarSwitch=true;
  } catch(error) {result.errors.push(String(error.stack||error));}
  document.getElementById('vector-result').textContent=JSON.stringify(result);
}());
</script>
'''
page=root/'vectors-live.generated.html'
page.write_text((root/'models-preview.html').read_text(encoding='utf-8').replace('</body>',check+'</body>'),encoding='utf-8')
server=make_server(0)
threading.Thread(target=server.serve_forever,daemon=True).start()
try:
    with tempfile.TemporaryDirectory(prefix='vectors-edge-') as profile:
        run=subprocess.run([r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
            '--headless','--disable-gpu','--no-first-run','--user-data-dir='+profile,
            '--window-size=1400,1000','--virtual-time-budget=600000',
            '--screenshot='+str(output / 'vector-preview.png'),'--dump-dom',
            f'http://127.0.0.1:{server.server_port}/{page.name}'],
            capture_output=True,text=True,encoding='utf-8',errors='replace',timeout=660)
        match=re.search(r'<pre id="vector-result">(.*?)</pre>',run.stdout,re.S)
        if not match or match[1]=='RUNNING':raise RuntimeError('Browser did not complete: '+run.stderr[-1000:])
        result=json.loads(match[1]);print(json.dumps(result,indent=2))
        (output / 'vector-live-results.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
        if result['errors'] or len(result['checks'])!=10:raise SystemExit(1)
finally:
    server.shutdown();server.server_close();page.unlink(missing_ok=True)
