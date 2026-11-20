"""Run isolated salinity behavior checks in headless Edge; no NOAA data needed."""
from pathlib import Path
import re
import subprocess
import tempfile

page = Path(__file__).with_name('salinity-tests.html')
with tempfile.TemporaryDirectory(prefix='salinity-edge-') as profile:
    result = subprocess.run([
        r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
        '--headless', '--disable-gpu', '--no-first-run',
        '--user-data-dir=' + profile, '--virtual-time-budget=3000',
        '--dump-dom', page.resolve().as_uri()
    ], capture_output=True, text=True, encoding='utf-8', errors='replace', timeout=30)
    match = re.search(r'<pre id="results">(.*?)</pre>', result.stdout, re.S)
    summary = match.group(1) if match else 'FAIL: no page output\n' + result.stderr[-2000:]
    print(summary)
    if 'FAIL' in summary or 'RUNNING' in summary:
        raise SystemExit(1)
