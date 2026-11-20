"""Exercise the model-field preview against live NOAA services in headless Edge."""
from pathlib import Path
import json
import re
import subprocess
import tempfile
import threading
import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'src'))
from preview_server import Handler, make_server
Handler.log_message = lambda *args: None

root = Path(__file__).resolve().parents[1] / 'web'
output = Path(__file__).resolve().parents[1] / 'reports' / 'latest'
output.mkdir(parents=True, exist_ok=True)
check = r'''
<pre id="live-result">RUNNING</pre>
<script>
(async function () {
  var result = {origin: location.origin, models: []};
  try {
    map.setView([37.8, -76.2], 8, {animate:false});
    var select = document.querySelector('[aria-label="OFS model"]');
    var box = select.closest('.leaflet-bar');
    var status = box.querySelector('[role="status"]');
    var views = {CBOFS:[37.8,-76.2], CIOFS:[60,-152], DBOFS:[39,-75.2], GOMOFS:[43,-69], TBOFS:[27.8,-82.6]};
    for (var model of Object.keys(views)) {
     for (var field of ["salt", "temp", "zeta"]) {
      select.value = model;
      if (field === 'salt') select.onchange();
      map.setView(views[model], 8, {animate:false});
      var fieldSelect = box.querySelector('[aria-label="Model field"]');
      fieldSelect.value = field;
      var palette=box.querySelector('[aria-label="Field colormap"]');
      var opacity=box.querySelector('[aria-label="Model layer opacity"]');
      palette.value='psu-viridis'; opacity.value=35; opacity.oninput();
      if (field === 'salt') await box.querySelector('button').onclick();
      else await fieldSelect.onchange();
      for (var n=0; n<120 && /Loading (?:salinity|field) tiles/.test(status.textContent); n++) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      var legend = box.querySelector('.salinity-legend img');
      for (var n=0; n<20 && !legend.complete; n++) await new Promise(resolve => setTimeout(resolve,500));
      var opaquePixels = 0, tiles = 0;
      document.querySelectorAll('img.leaflet-tile').forEach(function (img) {
        if (!img.src.includes('/thredds/wms/') || !img.complete || !img.naturalWidth) return;
        var canvas = document.createElement('canvas'); canvas.width=256; canvas.height=256;
        var ctx=canvas.getContext('2d'); ctx.drawImage(img,0,0);
        var pixels=ctx.getImageData(0,0,256,256).data; tiles++;
        for (var i=3;i<pixels.length;i+=4) if (pixels[i]) opaquePixels++;
      });
      var active;
      map.eachLayer(function (layer) { if (layer.wmsParams) active = layer; });
      if (active.options.opacity !== 0.35 || !active.wmsParams.styles.endsWith('/psu-viridis')) throw Error('Display settings not preserved');
      if (!active || active.wmsParams.layers !== field) throw Error('Wrong field rendered');
      if ((field === 'zeta') === ('elevation' in active.wmsParams)) throw Error('Incorrect vertical selection');
      result.models.push({model: model, field:field, status: status.textContent, tiles:tiles, opaquePixels:opaquePixels,
        legendVisible: !box.querySelector('.salinity-legend').hidden,
        legendLoaded: legend.naturalWidth > 0});
    }
    }
    result.mapReady = !!map;
  } catch (error) { result.error = String(error.stack || error); }
  document.getElementById('live-result').textContent = JSON.stringify(result);
}());
</script>
'''
page = root / 'salinity-live.generated.html'
page.write_text((root / 'models-preview.html').read_text(encoding='utf-8').replace('</body>', check + '</body>'), encoding='utf-8')
try:
    server = make_server(0)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    with tempfile.TemporaryDirectory(prefix='noaa-live-edge-') as profile:
        run = subprocess.run([
            r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
            '--headless', '--disable-gpu', '--no-first-run',
            '--user-data-dir=' + profile, '--virtual-time-budget=600000',
            '--dump-dom', f'http://127.0.0.1:{server.server_port}/{page.name}'
        ], capture_output=True, text=True, encoding='utf-8', errors='replace', timeout=660)
        match = re.search(r'<pre id="live-result">(.*?)</pre>', run.stdout, re.S)
        if not match or match.group(1) == 'RUNNING':
            raise SystemExit('No completed browser result: ' + run.stderr[-2000:])
        result = json.loads(match.group(1))
        print(json.dumps(result, indent=2))
        (output / 'field-live-results.json').write_text(json.dumps(result, indent=2) + '\n', encoding='utf-8')
        if result.get('error') or not all(m['legendVisible'] and m['legendLoaded'] and m['opaquePixels'] > 0 for m in result['models']):
            raise SystemExit(1)
finally:
    server.shutdown()
    server.server_close()
    page.unlink(missing_ok=True)
