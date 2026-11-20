"""Live browser coverage of all available scalar/vector OFS fields."""
import json
from pathlib import Path
import re
import subprocess
import tempfile
import threading
import sys
import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'src'))
from preview_server import Handler,make_server

Handler.log_message=lambda *args:None
root=Path(__file__).resolve().parents[1] / 'web'
output = Path(__file__).resolve().parents[1] / 'reports' / 'latest'
output.mkdir(parents=True, exist_ok=True)
check=r'''
<pre id="all-result">RUNNING</pre><script>
(async function(){
 var result={checks:[],errors:[]};
 var models=document.querySelector('[aria-label="OFS model"]'),fields=document.querySelector('[aria-label="Model field"]');
 var box=models.closest('.leaflet-bar'),status=box.querySelector('[role=status]');
 var views={CBOFS:[37.8,-76.2,8],CIOFS:[60,-152,7],DBOFS:[39,-75.2,8],GOMOFS:[43,-69,6],
 LEOFS:[42,-81,7],LMHOFS:[44.5,-84.5,6],LOOFS:[43.7,-77.8,7],LSOFS:[47.5,-87.5,6],NGOFS2:[29,-90,6],
 NYOFS:[40.6,-74.05,9],SFBOFS:[37.85,-122.3,9],SJROFS:[30.25,-81.6,9],SSCOFS:[47.5,-124,6],TBOFS:[27.8,-82.6,9],WCOFS:[40,-124,5]};
 for(var model of Object.keys(views)){
  models.value=model;models.onchange();map.setView(views[model].slice(0,2),views[model][2],{animate:false});
  for(var field of ['salt','temp','zeta','currents','wind']){
   if(model==='NYOFS' && ['salt','temp'].includes(field)){
    if(!Array.from(fields.options).find(o=>o.value===field).disabled)result.errors.push('NYOFS missing field is enabled');
    continue;
   }
   try{
    fields.value=field;await box.querySelector('button').onclick();
    for(var i=0;i<180 && /Loading field tiles/.test(status.textContent);i++)await new Promise(r=>setTimeout(r,500));
    var count=0,kind='WMS',layer=null;
    map.eachLayer(function(l){if(l.canvas)layer=l;});
    if(layer){
     if(layer.canvas.classList.contains('model-vector-arrows')){count=Number(layer.canvas.dataset.arrowCount);kind='arrows';}
     else {
      kind='mesh';var gl=layer.gl;var pixels=new Uint8Array(layer.canvas.width*layer.canvas.height*4);
      gl.readPixels(0,0,layer.canvas.width,layer.canvas.height,gl.RGBA,gl.UNSIGNED_BYTE,pixels);
      for(var j=3;j<pixels.length;j+=4)if(pixels[j])count++;
     }
    }else{
     document.querySelectorAll('img.leaflet-tile').forEach(function(img){
      if(!img.src.includes('/thredds/wms/')||!img.complete||!img.naturalWidth)return;
      var c=document.createElement('canvas');c.width=c.height=256;var ctx=c.getContext('2d');ctx.drawImage(img,0,0);
      var pixels=ctx.getImageData(0,0,256,256).data;for(var j=3;j<pixels.length;j+=4)if(pixels[j])count++;
     });
    }
    var vectorField=['currents','wind'].includes(field);
    if(vectorField !== (kind==='arrows'))throw Error('Wrong rendering type: '+kind);
    var legend=box.querySelector('.salinity-legend img');
    for(var i=0;i<20 && legend && !legend.complete;i++)await new Promise(r=>setTimeout(r,500));
    if(!count || box.querySelector('.salinity-legend').hidden || !legend || !legend.naturalWidth)throw Error(status.textContent+'; rendered count='+count);
    result.checks.push({model:model,field:field,rendering:kind,count:count,status:status.textContent});
   }catch(e){result.errors.push(model+'/'+field+': '+e.message);}
  }
 }
 document.getElementById('all-result').textContent=JSON.stringify(result);
}());</script>'''
focused='--focus' in sys.argv
if focused:
 check=check.replace('Object.keys(views)', "['SFBOFS']").replace("['salt','temp','zeta','currents','wind']", "['temp']")
 check=check.replace("    result.checks.push", """
    var savedLayer=layer, originalColor=Array.from(pixels).reduce((a,v,i)=>a+(i%4===0?v:0),0);
    var apiCalls=0,oldFetch=window.fetch;
    window.fetch=function(url,options){if(String(url).includes('/api/mesh'))apiCalls++;return oldFetch(url,options);};
    var palette=box.querySelector('[aria-label="Field colormap"]');palette.value='psu-inferno';await palette.onchange();
    gl.readPixels(0,0,layer.canvas.width,layer.canvas.height,gl.RGBA,gl.UNSIGNED_BYTE,pixels);
    var changedColor=Array.from(pixels).reduce((a,v,i)=>a+(i%4===0?v:0),0);
    if(changedColor===originalColor || apiCalls)throw Error('Palette did not update in place');
    var opacity=box.querySelector('[aria-label="Model layer opacity"]');opacity.value=35;opacity.oninput();
    if(layer.canvas.style.opacity!=='0.35')throw Error('Mesh opacity failed');opacity.value=65;opacity.oninput();
    map.setZoom(10,{animate:false});map.setZoom(9,{animate:false});
    result.checks.push""")
page=root/'all-ofs.generated.html'
page.write_text((root/'models-preview.html').read_text(encoding='utf-8').replace('</body>',check+'</body>'),encoding='utf-8')
server=make_server(0);threading.Thread(target=server.serve_forever,daemon=True).start()
try:
 with tempfile.TemporaryDirectory(prefix='all-ofs-edge-') as profile:
  run=subprocess.run([r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe','--headless',
   '--enable-unsafe-swiftshader','--no-first-run','--user-data-dir='+profile,'--window-size=1400,1000',
   '--virtual-time-budget=1800000','--screenshot='+str(output / ('mesh-display-preview.png' if focused else 'all-ofs-preview.png')),'--dump-dom',
   f'http://127.0.0.1:{server.server_port}/{page.name}'],capture_output=True,text=True,encoding='utf-8',errors='replace',timeout=1800)
  match=re.search(r'<pre id="all-result">(.*?)</pre>',run.stdout,re.S)
  if not match or match[1]=='RUNNING':raise RuntimeError('No completed browser result: '+run.stderr[-2000:])
  result=json.loads(match[1]);(output / ('mesh-display-results.json' if focused else 'all-ofs-results.json')).write_text(json.dumps(result,indent=2)+'\n')
  print(json.dumps({'passed':len(result['checks']),'expected':1 if focused else 73,'errors':result['errors']},indent=2))
  if result['errors'] or len(result['checks'])!=(1 if focused else 73):raise SystemExit(1)
finally:
 server.shutdown();server.server_close();page.unlink(missing_ok=True)
