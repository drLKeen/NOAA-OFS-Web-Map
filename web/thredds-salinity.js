/* THREDDS/ncWMS scalar field overlay. Requires Leaflet and browser fetch. */
(function (root) {
  'use strict';
  var host = /^https?:$/.test(location.protocol) ? location.origin : 'https://opendap.co-ops.nos.noaa.gov';
  var fields = {
    salt: {label: 'Salinity', units: 'PSU', range: '0,40', surface: true},
    temp: {label: 'Temperature', units: '\u00b0C', range: '-2,35', surface: true},
    zeta: {label: 'Water level', units: 'm', range: '-6,6', surface: false},
    currents: {label: 'Currents', vector: true},
    wind: {label: 'Wind', vector: true}
  };
  function children(node, name) {
    return Array.from(node.children).filter(function (n) { return n.localName === name; });
  }
  function descendants(node, name) {
    return Array.from(node.getElementsByTagNameNS('*', name));
  }
  function content(node, name) {
    var n = children(node, name)[0];
    return n ? n.textContent.trim() : '';
  }
  async function xml(url, signal) {
    var response = await fetch(url, {signal: signal, cache: 'no-store'});
    if (!response.ok) throw new Error('THREDDS returned HTTP ' + response.status + '. Retry when the service is available.');
    var doc = new DOMParser().parseFromString(await response.text(), 'application/xml');
    if (descendants(doc, 'parsererror').length) throw new Error('THREDDS returned invalid XML.');
    var error = descendants(doc, 'ServiceException')[0] || descendants(doc, 'ExceptionText')[0];
    if (error) throw new Error(error.textContent.trim());
    return doc;
  }
  async function discover(system, field, signal, requested) {
    var endpoint;
    if (system === 'WCOFS') {
      var response = await fetch(new URL('/api/dataset?' + new URLSearchParams({model:system,time:requested||''}), location.origin).href, {signal:signal});
      var result = await response.json();
      if (!response.ok) throw Error(result.error || 'No forecast dataset available');
      endpoint = new URL(host + '/thredds/wms/' + result.path);
    } else {
    var catalogURL = host + '/thredds/catalog/' + system + '/fmrc/catalog.xml';
    var catalog = await xml(catalogURL, signal);
    var datasets = descendants(catalog, 'dataset').filter(function (d) {
      return /_best\.ncd$/.test(d.getAttribute('urlPath') || '');
    });
    if (datasets.length !== 1) throw new Error('No unique Best Time Series dataset is advertised.');
    var dataset = datasets[0], serviceName = '', node = dataset;
    while (node && !serviceName) {
      serviceName = node.getAttribute && node.getAttribute('serviceName');
      serviceName = serviceName || content(node, 'serviceName');
      children(node, 'metadata').forEach(function (m) {
        if (node === dataset || m.getAttribute('inherited') === 'true') serviceName = serviceName || content(m, 'serviceName');
      });
      node = node.parentElement;
    }
    var service = descendants(catalog, 'service').find(function (s) { return s.getAttribute('name') === serviceName; });
    var services = service ? [service].concat(descendants(service, 'service')) : [];
    var wms = services.find(function (s) { return (s.getAttribute('serviceType') || '').toUpperCase() === 'WMS'; });
    if (!wms) throw new Error('This dataset does not advertise WMS. OPeNDAP alone cannot supply Leaflet image tiles.');
    endpoint = new URL(wms.getAttribute('base') + dataset.getAttribute('urlPath'), catalogURL);
    }
    var capsURL = new URL(endpoint);
    capsURL.search = 'service=WMS&request=GetCapabilities&version=1.1.1';
    var caps = await xml(capsURL.href, signal);
    var layer = descendants(caps, 'Layer').find(function (l) { return content(l, 'Name') === field; });
    if (!layer) throw new Error('WMS does not advertise ' + fields[field].label.toLowerCase() + ' for this system.');
    var styles = children(layer, 'Style').map(function (s) { return content(s, 'Name'); });
    var style = ['raster/default', 'default-scalar/default', 'boxfill/rainbow'].find(function (s) { return styles.includes(s); });
    if (!style) throw new Error('WMS does not advertise a supported image style.');
    var dimensions = {}, cursor = layer;
    while (cursor && cursor.localName === 'Layer') {
      children(cursor, 'Extent').concat(children(cursor, 'Dimension')).forEach(function (d) {
        var name = (d.getAttribute('name') || '').toLowerCase();
        if (!dimensions[name] && d.textContent.trim()) dimensions[name] = d;
      });
      cursor = cursor.parentElement;
    }
    var elevation = dimensions.elevation, surface;
    if (fields[field].surface) {
      if (!elevation) throw new Error('No vertical coordinate is advertised; surface field cannot be selected safely.');
      var units = elevation.getAttribute('units') || '';
      if (!units) {
        var declaration = descendants(caps, 'Dimension').find(function (d) { return d.getAttribute('name') === 'elevation'; });
        units = declaration ? declaration.getAttribute('units') || '' : '';
      }
      var levels = elevation.textContent.trim().split(',').map(Number);
      if (!levels.length || !levels.every(Number.isFinite)) throw new Error('Unsupported vertical extent. Expected explicit ROMS sigma levels.');
      // ROMS sigma levels run from -1 (bottom) to 0 (surface). Do not guess depth conventions.
      if (!levels.every(function (v) { return v >= -1 && v <= 0; }) || !/^(|1|sigma|s_rho|dimensionless|ncwms:height)$/i.test(units)) {
        throw new Error('Unrecognized vertical coordinate (' + units + '); cannot safely choose the surface.');
      }
      surface = Math.max.apply(null, levels);
    }
    var time = dimensions.time;
    if (!time) throw new Error('No forecast time extent is advertised.');
    return {url: endpoint.href, style: style, surface: surface, times: time.textContent.trim(), defaultTime: time.getAttribute('default') || ''};
  }
  root.addThreddsSalinity = function (map) {
    var overlay, controller, generation = 0;
    var control = L.control({position: 'topright'});
    control.onAdd = function () {
      var box = L.DomUtil.create('div', 'leaflet-bar');
      box.style.cssText = 'background:white;color:#222;padding:10px;max-width:280px;font:13px/1.4 sans-serif';
      box.innerHTML = '<strong>Model field</strong><br>' +
        '<label>OFS <select aria-label="OFS model"><option>CBOFS</option><option>CIOFS</option><option>DBOFS</option><option>GOMOFS</option><option>LEOFS</option><option>LMHOFS</option><option>LOOFS</option><option>LSOFS</option><option>NGOFS2</option><option>NYOFS</option><option>SFBOFS</option><option>SJROFS</option><option>SSCOFS</option><option>TBOFS</option><option>WCOFS</option></select></label><br>' +
        '<label>Field <select aria-label="Model field"><option value="salt">Salinity</option><option value="temp">Temperature</option><option value="zeta">Water level</option><option value="currents">Currents</option><option value="wind">Wind</option></select></label><br>' +
        '<label>UTC time <input aria-label="UTC time" type="datetime-local" step="3600" style="max-width:190px"></label><br>' +
        '<label>Colormap <select aria-label="Field colormap"><option value="default">THREDDS default</option><option value="psu-viridis">Viridis</option><option value="psu-inferno">Inferno</option></select></label><br>' +
        '<label>Opacity <input aria-label="Model layer opacity" type="range" min="0" max="100" step="5" value="65" style="width:140px"> <output class="salinity-opacity">65%</output></label><br>' +
        '<button type="button">Load field</button> <button type="button">Clear</button>' +
        '<div role="status" aria-live="polite">Choose a model and field. Blank time uses the server default.</div><div class="salinity-legend" hidden></div>';
      L.DomEvent.disableClickPropagation(box);
      L.DomEvent.disableScrollPropagation(box);
      var select = box.querySelector('select'), input = box.querySelector('input');
      var fieldSelect = box.querySelector('[aria-label="Model field"]');
      var palette = box.querySelector('[aria-label="Field colormap"]');
      var opacity = box.querySelector('[aria-label="Model layer opacity"]');
      var buttons = box.querySelectorAll('button'), status = box.querySelector('[role=status]');
      var legend = box.querySelector('.salinity-legend');
      legend.innerHTML = '<img alt="Model field color scale" style="max-height:200px;max-width:240px"><br><span class="field-description"></span>';
      function clear() {
        generation++;
        if (controller) controller.abort();
        if (overlay) map.removeLayer(overlay);
        overlay = null; legend.hidden = true;
      }
      buttons[1].onclick = function () { clear(); status.textContent = 'Model field cleared.'; };
      buttons[0].onclick = async function () {
        clear(); var request = generation;
        controller = new AbortController();
        var activeController = controller;
        var timeout = setTimeout(function () { activeController.abort(); }, 180000);
        var field = fieldSelect.value, spec = fields[field];
        status.textContent = 'Discovering THREDDS ' + spec.label.toLowerCase() + '...';
        try {
          if (spec.vector) {
            var vectorURL = new URL('/api/vectors', location.origin);
            vectorURL.search = new URLSearchParams({model:select.value, field:field,
              time:input.value ? new Date(input.value + 'Z').toISOString() : ''}).toString();
            var response = await fetch(vectorURL.href, {signal:controller.signal, cache:'no-store'});
            if (!response.ok) { var detail = await response.json().catch(function(){return {};}); throw new Error(detail.error || 'Vector request failed (HTTP ' + response.status + ').'); }
            var vectors = await response.json();
            var colors = await loadVectorColors(vectors.source, field, palette.value);
            if (request !== generation) return;
            overlay = createVectorArrows(vectors, colors, Number(opacity.value)/100).addTo(map);
            legend.innerHTML = '<img alt="Speed color scale" width="240" height="14"><div class="vector-scale"></div>' +
              '<div><svg width="32" height="16" aria-label="Reference arrow" style="vertical-align:middle"><path d="M4 8H28 M22 4L28 8L22 12" fill="none" stroke="currentColor" stroke-width="1.6"/></svg><span class="vector-length"></span></div><div>Arrows point toward flow.<br>Sampled for readability.</div>';
            legend.querySelector('img').src = colors.url;
            legend.querySelector('.vector-scale').textContent = 'Speed: 0 to ' + overlay.maximum.toFixed(1) + ' m/s';
            legend.querySelector('.vector-length').textContent = '= ' + (overlay.maximum/2).toFixed(2) + ' m/s';
            legend.hidden = false;
            status.textContent = select.value + ' ' + spec.label.toLowerCase() + ' | ' + vectors.time +
              (vectors.surface !== null ? ' | surface' : '');
            return;
          }
          if (!['CBOFS','CIOFS','DBOFS','GOMOFS','TBOFS','WCOFS'].includes(select.value)) {
            var meshURL = new URL('/api/mesh',location.origin);
            meshURL.search = new URLSearchParams({model:select.value,field:field,time:input.value ? new Date(input.value+'Z').toISOString() : ''});
            var meshResponse=await fetch(meshURL.href,{signal:controller.signal,cache:'no-store'});
            if(!meshResponse.ok){var errorDetail=await meshResponse.json().catch(function(){return {};});throw Error(errorDetail.error||'Mesh request failed (HTTP '+meshResponse.status+').');}
            var mesh=await meshResponse.json();
            var meshColors=await loadVectorColors(mesh.source,field,palette.value);
            if(request!==generation)return;
            overlay=createMeshLayer(mesh,meshColors,spec.range,Number(opacity.value)/100).addTo(map);
            legend.innerHTML='<img alt="Field color scale" width="240" height="14"><div class="field-description"></div>';
            legend.querySelector('img').src=meshColors.url;
            legend.querySelector('.field-description').textContent=spec.label+': '+spec.range.replace(',', ' to ')+' '+spec.units+(spec.surface?' | surface':' | model datum');
            legend.hidden=false;
            status.textContent=select.value+' '+spec.label.toLowerCase()+' | '+mesh.time;
            return;
          }
          legend.innerHTML = '<img alt="Model field color scale" style="max-height:200px;max-width:240px"><br><span class="field-description"></span>';
          var source = await discover(select.value, field, controller.signal, input.value ? new Date(input.value+'Z').toISOString() : '');
          if (request !== generation) return;
          var time = select.value === 'WCOFS' ? source.defaultTime : input.value ? new Date(input.value + 'Z').toISOString() : source.defaultTime;
          if (!time) throw new Error('Enter a UTC time. The server did not advertise a default.');
          var requested = Date.parse(time), extents = source.times.split(',');
          if (time !== 'current' && (!Number.isFinite(requested) || !extents.some(function (e) {
            var parts = e.trim().split('/');
            return parts.length === 1 ? Date.parse(parts[0]) === requested : requested >= Date.parse(parts[0]) && requested <= Date.parse(parts[1]);
          }))) throw new Error('Requested time is outside the advertised times: ' + source.times);
          var style = palette.value === 'default' ? source.style : source.style.split('/')[0] + '/' + palette.value;
          overlay = L.tileLayer.wms(source.url, Object.assign({
            layers: field, styles: style, format: 'image/png', transparent: true,
            version: '1.1.1', time: time,
            colorscalerange: spec.range, numcolorbands: 250, logscale: false,
            opacity: Number(opacity.value) / 100, attribution: 'NOAA OFS / THREDDS ' + spec.label.toLowerCase()
          }, spec.surface ? {elevation: source.surface} : {}));
          var legendURL = new URL(source.url);
          legendURL.search = 'service=WMS&request=GetLegendGraphic&version=1.1.1&layers=' + field + '&styles=' + encodeURIComponent(style) + '&palette=' + encodeURIComponent(style.split('/')[1]) + '&colorscalerange=' + spec.range + '&numcolorbands=250&format=image/png';
          legend.querySelector('img').alt = spec.label + ' color scale (' + spec.units + ')';
          legend.querySelector('.field-description').textContent = (spec.surface ? 'Top model layer. ' : 'Relative to model datum. ') + 'Scale: ' + spec.range.replace(',', ' to ') + ' ' + spec.units;
          legend.querySelector('img').src = legendURL.href;
          var failed = false;
          overlay.on('tileerror', function () {
            if (request !== generation) return;
            failed = true; legend.hidden = true;
            status.textContent = spec.label + ' tiles failed. Check THREDDS availability and the selected UTC time.';
          });
          overlay.on('load', function () {
            if (request !== generation || failed) return;
            status.textContent = select.value + ' ' + spec.label.toLowerCase() + ' | ' + time + (spec.surface ? ' | sigma ' + source.surface : '');
            legend.hidden = false;
          });
          status.textContent = 'Loading field tiles...';
          overlay.addTo(map);
        } catch (error) {
          if (request !== generation) return;
          status.textContent = error.name === 'AbortError' ? 'THREDDS request timed out. Retry later.' : error instanceof TypeError ? 'Cannot reach THREDDS from this browser. The service may be down or its CORS policy may block catalog access.' : error.message;
        } finally { clearTimeout(timeout); }
      };
      opacity.oninput = function () {
        box.querySelector('.salinity-opacity').textContent = opacity.value + '%';
        if (overlay) overlay.setOpacity(Number(opacity.value) / 100);
      };
      palette.onchange = async function () {
        if (overlay && overlay.setColors) {
          var active=overlay, choice=palette.value;
          try {
            var next=await loadVectorColors(active.data.source,fieldSelect.value,choice);
            if(overlay!==active || palette.value!==choice)return;
            active.setColors(next);legend.querySelector('img').src=next.url;
          } catch(error) {if(overlay===active)status.textContent=error.message;}
        } else if (overlay) return buttons[0].onclick();
      };
      fieldSelect.onchange = function () {
        if (overlay || (controller && !controller.signal.aborted)) return buttons[0].onclick();
        status.textContent = 'Field changed. Click Load field.';
      };
      select.onchange = function () {
        clear();
        Array.from(fieldSelect.options).forEach(function(option){option.disabled=select.value==='NYOFS' && ['salt','temp'].includes(option.value);});
        if(fieldSelect.selectedOptions[0].disabled)fieldSelect.value='zeta';
        status.textContent=select.value==='NYOFS' ? 'NYOFS provides water level, currents and wind. Click Load field.' : 'Selection changed. Click Load field.';
      };
      input.onchange = function () {clear();status.textContent='Time changed. Click Load field.';};
      return box;
    };
    control.addTo(map);
    return control;
  };
}(window));
