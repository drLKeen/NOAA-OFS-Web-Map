"""Run local behavior tests and a live NOAA/Leaflet integration check in Edge."""
from pathlib import Path
import re
import subprocess
import tempfile

root = Path(__file__).resolve().parents[1] / 'web'
edge = Path(r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe')
integration = root / 'station-integration.generated.html'
check = r'''
<pre id="integration">RUNNING</pre>
<script>
try {
  map.setView([37.85,-122.335],10);
  var attempts=0;
  var timer=setInterval(function() {
    var cached=ofs_station_cache.sfb;
    if (cached && cached.markers.length) {
      clearInterval(timer);
      var count=ofs_station_layer.getLayers().length;
      var sfCount=cached.markers.length;
      var first=cached.markers[0];
      map.setZoom(4);
      var hidden=ofs_station_layer.getLayers().length===0;
      map.setView([37.85,-122.335],10);
      var reused=ofs_station_cache.sfb.markers[0]===first;
      document.getElementById('integration').textContent=
        (count>0 && hidden && reused ? 'PASS' : 'FAIL')+
        ': live SFBOFS markers='+sfCount+', visible stations='+count+
        ', hidden at zoom 4='+hidden+', cached marker reused='+reused;
    } else if (++attempts>=40) {
      clearInterval(timer);
      document.getElementById('integration').textContent='FAIL: live SFBOFS load timed out';
    }
  },500);
} catch(error) {document.getElementById('integration').textContent='FAIL: '+error.stack;}
</script>
'''
integration.write_text((root / 'models-preview.html').read_text(encoding='utf-8').replace('</body>',check+'</body>'),encoding='utf-8')
try:
    with tempfile.TemporaryDirectory(prefix='noaa-edge-') as profile:
        for page, element in [('station-tests.html','results'),(integration.name,'integration')]:
            result = subprocess.run([str(edge),'--headless','--disable-gpu','--no-first-run',
                '--user-data-dir='+profile,'--virtual-time-budget=25000','--dump-dom',
                ((Path(__file__).parent / page) if page == 'station-tests.html' else (root / page)).resolve().as_uri()],capture_output=True,text=True,encoding='utf-8',errors='replace',timeout=60)
            match = re.search(r'<pre id="'+element+r'">(.*?)</pre>',result.stdout,re.S)
            summary = match.group(1) if match else 'FAIL: no browser result\n'+result.stderr[-2000:]
            print(page+'\n'+summary)
            if 'FAIL' in summary or 'RUNNING' in summary:
                raise SystemExit(1)
finally:
    integration.unlink(missing_ok=True)
