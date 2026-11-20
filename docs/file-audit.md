# Web map file audit

Runtime dependency trace: `run_demo.py` starts `src/preview_server.py`, which
imports `ofs_data.py` and `vector_data.py`. The server serves only `web/`.
`models-preview.html` loads the four local JavaScript modules before its NOAA
base URL and loads remaining libraries remotely. No runtime or test code reads
the saved NOAA metadata, reference HTML, ZIP, screenshots, or result JSON.

## Standalone, historical, and unnecessary files

- `references/noaa/models.html`, `sfbofs.html`, and `sfbofs_large.html` are saved
  NOAA pages for comparison, not alternative supported local demo entry points.
- `display_ofsmap.original.js`, `ofsmap.js`, `ofsmap2.js`, and `ofslinks.js` are
  upstream comparison scripts. Do not load them alongside the modified national
  map: they share globals and create their own maps.
- Saved catalogs, DDS/DAS schemas, latest-files JSON, probe results, animation
  references, and capability XML describe earlier NOAA responses; they can age
  out and are not used as fixtures or runtime caches.
- The saved boundary ZIP and reference images are optional provenance assets.
- Historical screenshots/results are optional records, not current checks.
- Python bytecode is generated, interpreter-specific, and unnecessary. It is
  preserved in `archive/python-cache/`, outside Python's import search path.
- `vector_data.py` and `ofs_data.py` have standalone command-line probe modes,
  but both modules are also required by the server; keep them.
- Tests named salinity cover broader scalar behavior too. Keep their existing
  names and checks; the all-region test does not replace the isolated tests.
- `.MATLABDriveTag` files are MATLAB Drive sync metadata and remain untouched.

No original file was deleted. Optional files were grouped for review and can
be omitted from a demo distribution. The original README is retained unchanged
as historical research; its old repository launch path and proposed-work
sections are outdated.

## Complete inventory

| Original file | New location | Classification |
| --- | --- | --- |
| `__pycache__\ofs_data.cpython-310.pyc` | `archive/python-cache/ofs_data.cpython-310.pyc` | Generated Python bytecode; unnecessary for sharing |
| `__pycache__\preview_server.cpython-310.pyc` | `archive/python-cache/preview_server.cpython-310.pyc` | Generated Python bytecode; unnecessary for sharing |
| `__pycache__\vector_data.cpython-310.pyc` | `archive/python-cache/vector_data.cpython-310.pyc` | Generated Python bytecode; unnecessary for sharing |
| `all-ofs-catalog.xml` | `references/noaa/all-ofs-catalog.xml` | Downloaded reference or probe snapshot; not used by runtime/tests |
| `all-ofs-preview.png` | `reports/historical/all-ofs-preview.png` | Historical test output or preview; not current validation |
| `all-ofs-results.json` | `reports/historical/all-ofs-results.json` | Historical test output or preview; not current validation |
| `display_ofsmap.js` | `web/display_ofsmap.js` | Required browser source |
| `display_ofsmap.original.js` | `references/noaa/display_ofsmap.original.js` | Downloaded reference or probe snapshot; not used by runtime/tests |
| `field-capabilities.xml` | `references/noaa/field-capabilities.xml` | Downloaded reference or probe snapshot; not used by runtime/tests |
| `field-live-results.json` | `reports/historical/field-live-results.json` | Historical test output or preview; not current validation |
| `leofs-catalog.xml` | `references/noaa/leofs-catalog.xml` | Downloaded reference or probe snapshot; not used by runtime/tests |
| `LEOFS-files.xml` | `references/noaa/LEOFS-files.xml` | Downloaded reference or probe snapshot; not used by runtime/tests |
| `LEOFS-latest-files.json` | `references/noaa/LEOFS-latest-files.json` | Downloaded reference or probe snapshot; not used by runtime/tests |
| `LEOFS.das` | `references/noaa/LEOFS.das` | Downloaded reference or probe snapshot; not used by runtime/tests |
| `LEOFS.dds` | `references/noaa/LEOFS.dds` | Downloaded reference or probe snapshot; not used by runtime/tests |
| `lmhofs-catalog.xml` | `references/noaa/lmhofs-catalog.xml` | Downloaded reference or probe snapshot; not used by runtime/tests |
| `LMHOFS-files.xml` | `references/noaa/LMHOFS-files.xml` | Downloaded reference or probe snapshot; not used by runtime/tests |
| `LMHOFS-latest-files.json` | `references/noaa/LMHOFS-latest-files.json` | Downloaded reference or probe snapshot; not used by runtime/tests |
| `LMHOFS.das` | `references/noaa/LMHOFS.das` | Downloaded reference or probe snapshot; not used by runtime/tests |
| `LMHOFS.dds` | `references/noaa/LMHOFS.dds` | Downloaded reference or probe snapshot; not used by runtime/tests |
| `loofs-catalog.xml` | `references/noaa/loofs-catalog.xml` | Downloaded reference or probe snapshot; not used by runtime/tests |
| `LOOFS-files.xml` | `references/noaa/LOOFS-files.xml` | Downloaded reference or probe snapshot; not used by runtime/tests |
| `LOOFS-latest-files.json` | `references/noaa/LOOFS-latest-files.json` | Downloaded reference or probe snapshot; not used by runtime/tests |
| `LOOFS.das` | `references/noaa/LOOFS.das` | Downloaded reference or probe snapshot; not used by runtime/tests |
| `LOOFS.dds` | `references/noaa/LOOFS.dds` | Downloaded reference or probe snapshot; not used by runtime/tests |
| `lsofs-catalog.xml` | `references/noaa/lsofs-catalog.xml` | Downloaded reference or probe snapshot; not used by runtime/tests |
| `LSOFS-files.xml` | `references/noaa/LSOFS-files.xml` | Downloaded reference or probe snapshot; not used by runtime/tests |
| `LSOFS-latest-files.json` | `references/noaa/LSOFS-latest-files.json` | Downloaded reference or probe snapshot; not used by runtime/tests |
| `LSOFS.das` | `references/noaa/LSOFS.das` | Downloaded reference or probe snapshot; not used by runtime/tests |
| `LSOFS.dds` | `references/noaa/LSOFS.dds` | Downloaded reference or probe snapshot; not used by runtime/tests |
| `mesh-display-preview.png` | `reports/historical/mesh-display-preview.png` | Historical test output or preview; not current validation |
| `mesh-display-results.json` | `reports/historical/mesh-display-results.json` | Historical test output or preview; not current validation |
| `mesh-layer.js` | `web/mesh-layer.js` | Required browser source |
| `models-preview.html` | `web/models-preview.html` | Required browser source |
| `models.html` | `references/noaa/models.html` | Downloaded reference or probe snapshot; not used by runtime/tests |
| `ngofs2-catalog.xml` | `references/noaa/ngofs2-catalog.xml` | Downloaded reference or probe snapshot; not used by runtime/tests |
| `NGOFS2-files.xml` | `references/noaa/NGOFS2-files.xml` | Downloaded reference or probe snapshot; not used by runtime/tests |
| `NGOFS2-latest-files.json` | `references/noaa/NGOFS2-latest-files.json` | Downloaded reference or probe snapshot; not used by runtime/tests |
| `NGOFS2.das` | `references/noaa/NGOFS2.das` | Downloaded reference or probe snapshot; not used by runtime/tests |
| `NGOFS2.dds` | `references/noaa/NGOFS2.dds` | Downloaded reference or probe snapshot; not used by runtime/tests |
| `noaa-salinity-reference.png` | `references/noaa/noaa-salinity-reference.png` | Downloaded reference or probe snapshot; not used by runtime/tests |
| `nyofs-catalog.xml` | `references/noaa/nyofs-catalog.xml` | Downloaded reference or probe snapshot; not used by runtime/tests |
| `NYOFS-files.xml` | `references/noaa/NYOFS-files.xml` | Downloaded reference or probe snapshot; not used by runtime/tests |
| `NYOFS-latest-files.json` | `references/noaa/NYOFS-latest-files.json` | Downloaded reference or probe snapshot; not used by runtime/tests |
| `NYOFS.das` | `references/noaa/NYOFS.das` | Downloaded reference or probe snapshot; not used by runtime/tests |
| `NYOFS.dds` | `references/noaa/NYOFS.dds` | Downloaded reference or probe snapshot; not used by runtime/tests |
| `ofs-animation-reference.xml` | `references/noaa/ofs-animation-reference.xml` | Downloaded reference or probe snapshot; not used by runtime/tests |
| `ofs-mapplots-reference.js` | `references/noaa/ofs-mapplots-reference.js` | Downloaded reference or probe snapshot; not used by runtime/tests |
| `ofs-schema-probe.json` | `references/noaa/ofs-schema-probe.json` | Downloaded reference or probe snapshot; not used by runtime/tests |
| `ofs-wms-probe.json` | `references/noaa/ofs-wms-probe.json` | Downloaded reference or probe snapshot; not used by runtime/tests |
| `ofs_data.py` | `src/ofs_data.py` | Required Python server/data source |
| `OFS_MODELS_2024.zip` | `references/noaa/OFS_MODELS_2024.zip` | Downloaded reference or probe snapshot; not used by runtime/tests |
| `ofslinks.js` | `references/noaa/ofslinks.js` | Downloaded reference or probe snapshot; not used by runtime/tests |
| `ofsmap.js` | `references/noaa/ofsmap.js` | Downloaded reference or probe snapshot; not used by runtime/tests |
| `ofsmap2.js` | `references/noaa/ofsmap2.js` | Downloaded reference or probe snapshot; not used by runtime/tests |
| `preview_server.py` | `src/preview_server.py` | Required Python server/data source |
| `README.md` | `docs/source-research.md` | Historical research and validation notes; contains superseded instructions |
| `salinity-display-results.json` | `reports/historical/salinity-display-results.json` | Historical test output or preview; not current validation |
| `salinity-live-results.json` | `reports/historical/salinity-live-results.json` | Historical test output or preview; not current validation |
| `salinity-tests.html` | `tests/salinity-tests.html` | Optional validation; not required to run demo |
| `sfbofs-catalog.xml` | `references/noaa/sfbofs-catalog.xml` | Downloaded reference or probe snapshot; not used by runtime/tests |
| `SFBOFS-files.xml` | `references/noaa/SFBOFS-files.xml` | Downloaded reference or probe snapshot; not used by runtime/tests |
| `SFBOFS-latest-files.json` | `references/noaa/SFBOFS-latest-files.json` | Downloaded reference or probe snapshot; not used by runtime/tests |
| `sfbofs-stations.json` | `references/noaa/sfbofs-stations.json` | Downloaded reference or probe snapshot; not used by runtime/tests |
| `SFBOFS.das` | `references/noaa/SFBOFS.das` | Downloaded reference or probe snapshot; not used by runtime/tests |
| `SFBOFS.dds` | `references/noaa/SFBOFS.dds` | Downloaded reference or probe snapshot; not used by runtime/tests |
| `sfbofs.html` | `references/noaa/sfbofs.html` | Downloaded reference or probe snapshot; not used by runtime/tests |
| `sfbofs_large.html` | `references/noaa/sfbofs_large.html` | Downloaded reference or probe snapshot; not used by runtime/tests |
| `sjrofs-catalog.xml` | `references/noaa/sjrofs-catalog.xml` | Downloaded reference or probe snapshot; not used by runtime/tests |
| `SJROFS-files.xml` | `references/noaa/SJROFS-files.xml` | Downloaded reference or probe snapshot; not used by runtime/tests |
| `SJROFS-latest-files.json` | `references/noaa/SJROFS-latest-files.json` | Downloaded reference or probe snapshot; not used by runtime/tests |
| `SJROFS.das` | `references/noaa/SJROFS.das` | Downloaded reference or probe snapshot; not used by runtime/tests |
| `SJROFS.dds` | `references/noaa/SJROFS.dds` | Downloaded reference or probe snapshot; not used by runtime/tests |
| `sscofs-catalog.xml` | `references/noaa/sscofs-catalog.xml` | Downloaded reference or probe snapshot; not used by runtime/tests |
| `SSCOFS-files.xml` | `references/noaa/SSCOFS-files.xml` | Downloaded reference or probe snapshot; not used by runtime/tests |
| `SSCOFS-latest-files.json` | `references/noaa/SSCOFS-latest-files.json` | Downloaded reference or probe snapshot; not used by runtime/tests |
| `SSCOFS.das` | `references/noaa/SSCOFS.das` | Downloaded reference or probe snapshot; not used by runtime/tests |
| `SSCOFS.dds` | `references/noaa/SSCOFS.dds` | Downloaded reference or probe snapshot; not used by runtime/tests |
| `station-tests.html` | `tests/station-tests.html` | Optional validation; not required to run demo |
| `thredds-default-reference.png` | `references/noaa/thredds-default-reference.png` | Downloaded reference or probe snapshot; not used by runtime/tests |
| `thredds-salinity.js` | `web/thredds-salinity.js` | Required browser source |
| `vector-arrows.js` | `web/vector-arrows.js` | Required browser source |
| `vector-live-results.json` | `reports/historical/vector-live-results.json` | Historical test output or preview; not current validation |
| `vector-palette.png` | `reports/historical/vector-palette.png` | Historical test output or preview; not current validation |
| `vector-preview.png` | `reports/historical/vector-preview.png` | Historical test output or preview; not current validation |
| `vector-reference.das` | `references/noaa/vector-reference.das` | Downloaded reference or probe snapshot; not used by runtime/tests |
| `vector-reference.dds` | `references/noaa/vector-reference.dds` | Downloaded reference or probe snapshot; not used by runtime/tests |
| `vector_data.py` | `src/vector_data.py` | Required Python server/data source |
| `verify_all_ofs.py` | `tests/verify_all_ofs.py` | Optional validation; not required to run demo |
| `verify_browser.py` | `tests/verify_browser.py` | Optional validation; not required to run demo |
| `verify_salinity.py` | `tests/verify_salinity.py` | Optional validation; not required to run demo |
| `verify_salinity_live.py` | `tests/verify_salinity_live.py` | Optional validation; not required to run demo |
| `verify_vectors.py` | `tests/verify_vectors.py` | Optional validation; not required to run demo |
| `WCOFS-caps.xml` | `references/noaa/WCOFS-caps.xml` | Downloaded reference or probe snapshot; not used by runtime/tests |
| `wcofs-catalog.xml` | `references/noaa/wcofs-catalog.xml` | Downloaded reference or probe snapshot; not used by runtime/tests |
| `WCOFS-files.xml` | `references/noaa/WCOFS-files.xml` | Downloaded reference or probe snapshot; not used by runtime/tests |
| `WCOFS-latest-files.json` | `references/noaa/WCOFS-latest-files.json` | Downloaded reference or probe snapshot; not used by runtime/tests |
| `WCOFS.das` | `references/noaa/WCOFS.das` | Downloaded reference or probe snapshot; not used by runtime/tests |
| `WCOFS.dds` | `references/noaa/WCOFS.dds` | Downloaded reference or probe snapshot; not used by runtime/tests |
