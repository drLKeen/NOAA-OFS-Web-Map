# NOAA map source comparison

## Model fields across all OFS regions

Run from the NOAA_OFS folder (Python 3, no extra packages):

```powershell
python THREDDS_Opendap_axesm/research/noaa-map-sources/preview_server.py
```

Open http://127.0.0.1:8000/models-preview.html. Zoom to the region, select its
OFS system and field, and click **Load field**. Colormap offers THREDDS default,
Viridis, and Inferno. Opacity adjusts the model layer immediately (0?100%).
Field changes preserve the colormap, opacity and requested time. Clear removes
the model layer; stations and overview boundaries remain interactive.

| OFS | Region | Scalar rendering | Fields |
| --- | --- | --- | --- |
| CBOFS | Chesapeake Bay | WMS / ROMS | All five |
| CIOFS | Cook Inlet | WMS / ROMS | All five |
| DBOFS | Delaware Bay | WMS / ROMS | All five |
| GOMOFS | Gulf of Maine | WMS / ROMS | All five |
| LEOFS | Lake Erie | Native FVCOM mesh | All five |
| LMHOFS | Lakes Michigan and Huron | Native FVCOM mesh | All five |
| LOOFS | Lake Ontario | Native FVCOM mesh | All five |
| LSOFS | Lake Superior | Native FVCOM mesh | All five |
| NGOFS2 | Northern Gulf of Mexico | Native FVCOM mesh | All five |
| NYOFS | New York and New Jersey | Native structured grid | Water level, currents, wind |
| SFBOFS | San Francisco Bay | Native FVCOM mesh | All five |
| SJROFS | St. Johns River | Native structured grid | All five |
| SSCOFS | Salish Sea and Columbia River | Native FVCOM mesh | All five |
| TBOFS | Tampa Bay | WMS / ROMS | All five |
| WCOFS | West Coast | WMS / ROMS | All five |

The five fields are salinity, temperature, water level, currents and wind.
NYOFS forecast files contain neither temperature nor salinity; their menu
options are disabled. Freshwater-model salinity can be zero. This is the set
of 15 OFS regions advertised by the NOAA catalog on 2026-10-21; Marine Channels
Forecast station products are separate products, not additional OFS grids.

Scalar scales are fixed demonstration ranges: 0?40 PSU, -2?35 degrees Celsius,
and -6?6 meters. Salinity and temperature use the top model layer. Water level
is relative to the model datum. Vectors are arrows whose direction is toward
motion and whose color and length show speed in m/s. Their legend reports the
loaded speed scale. Colormap and opacity apply to both rendering types.

Five ROMS systems use rolling Best Time Series datasets. Other models resolve
actual forecast files from the requested UTC date and two preceding days,
choosing a nearby valid time and preferring the most recent eligible cycle.
Single-file forecasts can be spaced three hours apart; selection is limited
to 90 minutes from the request. The displayed timestamp is the actual decoded
model time (legacy Float32 time coordinates can have second-level rounding).
Blank time uses the current UTC hour for native-file readers and the advertised
server default for rolling WMS datasets. Requests outside retained coverage
fail explicitly instead of silently loading an unrelated forecast.

NOAA WMS currently rejects the FVCOM and legacy structured-grid files, so the
local server reads numeric data for those models. `ofs_data.py` preserves FVCOM
triangle connectivity and wet node/cell masks, or constructs triangles from
adjacent wet structured-grid nodes. `mesh-layer.js` interpolates scalar values
within those native triangles in WebGL; it does not triangulate unrelated
points across land. Native scalar meshes are full resolution, so large regions
can take longer to load and need more browser memory. Use a WebGL-capable browser.

FVCOM currents and winds already specify east/north components. Legacy NYOFS
and SJROFS also provide earth-relative components. ROMS vectors use the grid
rotation and staggered-face alignment described below. Arrow data is sampled
for readability; scalar mesh connectivity is not decimated. The legacy SJROFS
wet mask uses positive 5 rather than 1, and invalid/missing values are excluded.

The server binds only to 127.0.0.1. It serves this folder, allowlisted NOAA WMS
routes, and `/api/dataset`, `/api/mesh`, `/api/vectors`. All upstream hosts are
fixed to NOAA THREDDS. Internet access is required. Share the folder for local
use or screen-share the demo; localhost links only work on the server computer.
Stop with Ctrl+C. Use `--port 8001` if needed. Restart after Python-module edits.
Hosted deployment needs the same API/proxy routes. Nothing is deployed to NOAA.

Validation entry points: `verify_all_ofs.py` covers the 73 available combinations;
`verify_vectors.py` checks vector geometry and the original five regions;
`verify_salinity_live.py` checks the original scalar combinations;
`verify_salinity.py` runs isolated selection/error checks. Browser tests use Edge
on Windows. `all-ofs-results.json` records successful rendering and any failures.
The all-region test uses software WebGL in headless Edge and checks rendered
pixels, arrows, legends and unavailable-field controls, not just HTTP status.
On 2026-10-21 all 73 available combinations passed (zero errors). A focused
SFBOFS mesh check (`verify_all_ofs.py --focus`) also passed opacity, zoom redraw,
and in-place palette changes without a mesh-data request. Visual review is
saved in `mesh-display-preview.png`; results in `mesh-display-results.json`.
Native mesh and arrow palettes now update in place; scalar WMS recoloring
requests new image tiles.

Inspected public HTML, JavaScript, and SFBOFS metadata on 2026-10-21.
The page and regional-script files are downloaded source snapshots. The national
`display_ofsmap.js` now contains the local extension described below; its original
download is preserved as `display_ofsmap.original.js`. No MATLAB app files were modified.

## Implemented local map

Open the local server URL above in a browser with internet access. It loads the modified
local script and NOAA's existing map libraries/assets. Zoom to level 9 or closer
to see stations; hover for names and click for station forecasts. Zooming out hides
stations. The original national overview markers and boundaries remain available.

For use on NOAA's site, replace `/ofs/js/display_ofsmap.js` with the modified file.
No production HTML changes or new JavaScript dependencies are required. This is a
local deliverable; nothing has been deployed to NOAA. The saved `models.html` is
still the original page source, so use `models-preview.html` for local review.

The extension adds configuration, three station functions, and three initialization
lines. Existing overview rendering is unchanged. Adjust `ofs_station_min_zoom`
(default 9) to change when stations appear. No clustering or station thinning is
applied: all valid stations inside the viewport are shown at regional zoom.

Regional query bounds are intentionally broad, hand-maintained geographic boxes;
they are not exact model boundaries. The downloaded shapefile has generic
Id/SHAPE_1/MATID/MATNAME fields with no usable OFS identifiers. Bounds can trigger
extra neighboring-region requests, but actual station coordinates determine
visibility. Update these boxes if model coverage expands.

Station lists and marker instances are cached for the page session, including
dissemination status. Reload the page to refresh metadata. Failed requests can
retry on the next pan/zoom after a 30-second cooldown. Requests time out after
15 seconds. Late responses consult the current viewport and zoom.

Validation: `python verify_browser.py` runs headless Edge on Windows. All 15
isolated behavior checks passed. The live NOAA/Leaflet integration check loaded
53 SFBOFS markers, displayed 42 stations in the test viewport, hid them at zoom 4,
and reused cached marker instances after zooming back. This does not constitute
live validation of every other regional endpoint or a visual review of all basemaps.

The following comparison describes the original downloaded NOAA scripts; national
script line references below refer to `display_ofsmap.original.js`.

## Source inventory

All page/script paths below are relative to https://tidesandcurrents.noaa.gov.

| Page | Main map script | Entry point | Data |
| --- | --- | --- | --- |
| `/models.html` | `/ofs/js/display_ofsmap.js` | `mapit()` | `/ofs/OFS_MODELS_2024.zip`, 15 hardcoded OFS markers, 2 hardcoded MCF markers |
| `/ofs/sfbofs/sfbofs.html` | `/ofs/js/ofsmap.js` | `mapit("sfb", "0")` | SFBOFS MDAPI metadata, filtered to subdomain `0`; two hardcoded subdomain markers |
| `/ofs/sfbofs/sfbofs_large.html` | `/ofs/js/ofsmap2.js` | `mapit("sfb", "la")` | Same SFBOFS MDAPI metadata, filtered to subdomain `la` |

Both regional pages also load `/ofs/js/ofslinks.js`, which populates station links and animation menus. It is not the map renderer.

Metadata URL:
https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations.json?type=sfbofs&expand=ofsmapoffsets

Snapshot: dissemination on; 53 OFSStationList records, 28 `la`, 25 `en`, none `0`. Consequently the landing page's station filter selects no station records; its two blue pins link to the entrance and large-bay pages. The large-bay page creates 28 red station markers, whether or not they are initially inside the viewport. These are forecast station locations, including virtual stations, not the full hydrodynamic grid.

## Relevant code locations

- `display_ofsmap.js:43`: national entry point, initial zoom 4.
- `display_ofsmap.js:51`: creates map, loads model shapefile, calls overview marker builders. No station request.
- `ofsmap.js:185`: SFBOFS view selection; default zoom 11, large-bay zoom 10, entrance zoom 12.
- `ofsmap.js:294`: station metadata request; endpoint currently uses global `in_ofs_region`.
- `ofsmap.js:310`: map creation, dissemination check, subdomain filtering, station marker creation, and optional subdomain markers.
- `ofsmap.js:383`: station detail URL; `:389` permanent labels; `:395` adds marker immediately.
- `ofsmap2.js:296`: equivalent metadata request.
- `ofsmap2.js:312`: updated map creation with minZoom 5 and maxZoom 13.
- `ofsmap2.js:406`: station detail URL; `:419` permanent tooltip and immediate marker addition.
- `sfbofs.html:605` and `sfbofs_large.html:620`: inline region/subdomain configuration.

## Zoom and library differences

None of the three map scripts registers `zoomend` or `moveend`, queries `getZoom`, or implements marker clustering or progressive station loading. Regional markers are selected once by subdomain and added immediately. More separated markers on zoom are consistent with reduced overlap; changing basemap details are independent of station data.

The national and SFBOFS landing pages load `/leaflet/leaflet.js`, Esri Leaflet, and the legacy `leaflet.label` plugin. Both use the Esri Oceans basemap; their OceansLabels layer is commented out.

The large-bay page loads Leaflet from `/ofs/js/leaflet_1.9.4/`, Esri Leaflet, and Esri Leaflet Vector. `ofsmap2.js` replaces legacy `bindLabel` with `bindTooltip`, uses permanent station tooltips with direction selected from the label offset, and combines World Ocean Base raster tiles with a World Ocean Reference vector layer. Its station selection algorithm is substantially the same as `ofsmap.js`.

## Proposed national-map modification

Extend `display_ofsmap.js` with a separately managed station layer:

1. Retain national model boundaries and overview markers at low zoom.
2. On `zoomend` and `moveend`, determine which model extents intersect the viewport. Above a configurable threshold (for example zoom 9 as a starting choice), fetch the corresponding MDAPI station lists and cache requests/results per model.
3. Add station markers within the viewport, respecting dissemination status. Include all relevant subdomains rather than copying the landing page's `subdomain === "0"` filter. Preserve a valid station subdomain in each detail link.
4. Hide the station layer below the threshold. Show labels on hover initially, with optional permanent labels at closer zoom. If progressive density within a region is wanted, add clustering or screen-space thinning as an explicit new behavior.
5. Recheck the current view when asynchronous requests complete; prevent duplicate loads/markers, handle request errors and retries, and deduplicate multi-subdomain records without relying on stationID alone (some records may lack an ID).

Do not simply include `ofsmap.js` alongside `display_ofsmap.js`: they share global names (`map`, `mapit`, `initialize_ofsmap`, `links`) and each creates its own map. Extract/adapt station-loading and marker-building functions to accept the existing map and explicit region arguments. Keep the existing label API for a minimal change, or upgrade the HTML dependencies and all marker labels together for a Leaflet 1.9.4 migration.

The validation scenarios above were implemented in `station-tests.html` and
`verify_browser.py`; no live NOAA deployment was performed.

## Palette naming verification (2026-10-21)

The menu label is THREDDS default, referring specifically to the WMS palette
named `default`. Its returned legend runs from dark blue to pale yellow.
It is not the colormap used by NOAA's published CBOFS salinity animation.
The published 2026-10-21 14:00 EDT salinity graphic uses discrete rainbow-like
bands with thresholds from 0 to 35 PSU; this preview uses a fixed 0?40 PSU range.
The live WMS metadata also reports `defaultPalette: rainbow`, distinct from the
explicit `palette=default` requested here. These names should not be conflated.

Comparison files: `noaa-salinity-reference.png`, `thredds-default-reference.png`.
NOAA source image:
https://cdn.tidesandcurrents.noaa.gov/ofs/cbofs/wwwgraphics/CBOFS2_cb_all_sa_fore_202610211400.png
The animation script replaces `model_graphics` in option entries with the
regional `wwwgraphics` URL; it does not append a `model_graphics` directory.

## Field selector validation (2026-10-21)

Fields: Salinity (`salt`, 0?40 PSU), Temperature (`temp`, -2?35 degrees Celsius),
and Water level (`zeta`, -6?6 meters). These are fixed demonstration color scales;
values beyond the range take the endpoint colors. The legend states the range
and units. Water level is relative to the model datum, not wave height or an
assumed tidal datum. No wave-height field is advertised by these five datasets.
Switching fields automatically reloads an active overlay with matching legend,
while preserving time, colormap, and opacity. Before the first load, select the
field and click Load field.

All 15 live field/system combinations passed tile and legend decoding and
nontransparent-pixel checks. The test verifies the requested variable and that
only salinity/temperature include an elevation parameter. Seven isolated
salinity behavior checks also passed.

## Wind and current arrows

The Field menu includes Wind and Currents. Both render only colored arrows,
with direction pointing TOWARD motion, length proportional to speed, and color
showing speed in m/s. Wind direction is the direction the air travels, not the
meteorological direction-from convention. A reference arrow and speed colorbar
show the scale. Color and length scales use the maximum of the sampled dataset
and stay fixed while panning/zooming; they can change with model/time/field.
Colormap and opacity controls apply to arrows too. No filled speed raster is
added beneath them. Zero/near-zero velocities appear as tiny dots.

`/api/vectors` uses `vector_data.py` (Python standard library only) to discover
the forecast Best Time Series, decode its time coordinate, and retrieve sparse
OPeNDAP ASCII subsets. Explicit times must be in range and within one hour of
a model timestep; the selected time is displayed. Blank time selects the nearest
model timestep to the current UTC hour. Currents use the maximum sigma level.
Only sampled wet rho points are displayed. Interior current samples average
the two actual adjacent u faces and the two adjacent v faces, honoring each
face mask and missing values, then rotate with the grid angle to east/north.
Wind is already collocated at rho points and receives the same rotation.
Unknown grid layouts, units, or reference frames are rejected.

Sampling uses a native-grid stride targeting at most 80 positions per longest
grid dimension. The browser shows at most one sample per 24-pixel display cell;
this is a visualization sample, not a full-resolution analysis/export product.
It does not interpolate a colored surface or interpolate vectors between samples.
OPeNDAP ASCII serialization limits precision to the server's textual output.
The canvas redraws on pan, zoom, and resize while stations remain clickable.

Validation: `python verify_vectors.py` checks cardinal-direction rotation,
speed preservation, fill rejection and truncated-response rejection, then
runs live wind/current loads for all five systems. It also checks actual canvas
geometry (east/right, north/up, 1:2 speed gives 1:2 arrow lengths), magnitude
colors, opacity, zoom redraw, palette reload and switching between scalar and
vector fields. Results: `vector-live-results.json`; screenshot: `vector-preview.png`.
Restart the local Python server after changes to its Python modules.
