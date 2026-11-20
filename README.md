# NOAA OFS web map demo

Interactive NOAA forecast-region and station map with salinity, temperature,
water level, wind, and current overlays. Runs locally using Python 3.10+ and
its standard library; MATLAB and pip packages are not required.

## Run

From this folder:

```powershell
python run_demo.py
```

Open http://127.0.0.1:8000/. Stop with Ctrl+C. To use another port, run
`python run_demo.py --port 8001`. The launcher also works by absolute path
from another working directory.

Internet access is required for NOAA data, map libraries, and basemap tiles.
Use a WebGL-capable browser. The server listens on localhost only.

## Demonstrate

1. Zoom into a region; station markers appear at zoom 9 or closer.
2. Hover for station names and click for NOAA station forecasts.
3. Select the OFS region and field, then click **Load field**.
4. Change the palette or opacity, zoom/pan, and clear the field overlay.

The demo supports 15 OFS regions. NYOFS has no temperature or salinity choice.
Forecast availability changes over time. Leave the requested time blank for
the current/default selection; the status reports the selected model time.
Temperature and salinity use the top model layer. Water level uses the model
datum. Arrows point toward motion and are sampled for readability; native
scalar meshes retain their connectivity and resolution.

## Folder layout

| Folder/file | Purpose | Needed to run? |
| --- | --- | --- |
| `run_demo.py` | Start the server | Yes |
| `src/` | Python server and NOAA data readers | Yes |
| `web/` | HTML entry page and four JavaScript modules | Yes |
| `tests/` | Isolated browser checks and live integration checks | No |
| `docs/` | File inventory and original research notes | No |
| `references/noaa/` | Downloaded NOAA pages, scripts, metadata, and comparison assets | No |
| `reports/historical/` | Previously recorded results and screenshots | No |
| `reports/latest/` | Outputs produced by future integration runs | No |
| `archive/python-cache/` | Preserved obsolete bytecode; safe to omit | No |

For a minimal runnable copy, include `run_demo.py`, `src/`, `web/`, and this
README. Retain upstream attribution comments in the source. Reference snapshots
are not an offline data fallback. The boundary ZIP is fetched from NOAA at
runtime; the saved copy is only a reference.

## Validation

Windows browser tests expect Microsoft Edge at its standard installation path.
Run commands from this folder:

```powershell
python tests/verify_salinity.py
python tests/verify_browser.py
python tests/verify_all_ofs.py --focus
```

The first uses isolated local fixtures. The second combines isolated station
checks with live NOAA/Leaflet integration. The third checks a live SFBOFS mesh.
`verify_all_ofs.py` without `--focus` checks 73 supported combinations and can
take 30 minutes. `verify_salinity_live.py` and `verify_vectors.py` retain
narrower five-region regression checks. Live results depend on upstream services.
Generated integration HTML is temporarily created in `web/` and cleaned up;
result JSON and screenshots go to `reports/latest/`. Historical reports are
not evidence that today's endpoints pass.

See [the file audit](docs/file-audit.md) for all original-to-new locations and
[historical research](docs/source-research.md) for provenance and earlier design
decisions. Historical launch paths and implementation proposals are superseded
by this guide and the current source.
