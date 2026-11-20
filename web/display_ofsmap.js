//*****************************************************************************
// JAVASCRIPT PROGRAM NAME: display_ofsmap.js 
//
// PURPOSE: To display individual OFS grids on the ESRI ArcGIS map with Leaflet
//          and shp.js JavaScript files
//
// AUTHOR: John Cassidy
//         NOAA/NOS/CO-OPS/ISD
//         October 4, 2021
//
// LIMITATION: This Javascript script supports the ESRI ArcGIS maps only.
//
// MODIFICATION HISTORY:
//  2026/10/21 - Added cached, viewport-filtered stations at regional zoom levels.
//  2026/09/02 - TAC- - Changed 'Lake Ontario' to 'Lake America'
//  2025/03/17 - TAC-4171 - Disabled a code line to not display the names (City, States, River, etc.)
//                          especially 'Gulf of Mexico' on the ESRI maps.
//  2025/02/28 - TAC-4144 - Changed 'Gulf of Mexico' to 'Gulf of America'
//  2024/08/22 - TAC-3965 - Updated for changing 'CREOFS' to 'SSCOFS' and new
//                          GIS ZIP file name
//  June 3, 2022 - TAC-3336 - Added MCF markers with the red icons
//
//*****************************************************************************
var latitude = null;
var longitude = null;
var zoom_ofs = null;
var links = new Array();
var map = null;
var ofs_markers = null;
var mcf_markers = null;
var ofs_station_min_zoom = 9;
var ofs_station_layer = null;
var ofs_station_cache = {};
// Broad query bounds [south, west, north, east], not model domain polygons.
// Keys are MDAPI/ station-detail region codes (e.g. ng, not ngofs2).
var ofs_station_regions = {
  ng: [24, -100, 33, -85], sfb: [36, -124, 39, -121],
  wc: [30, -135, 50, -115], ssc: [43, -129, 52, -120],
  cb: [35, -78, 40, -74], tb: [26, -84, 29, -81],
  db: [37, -77, 41, -73], ny: [38, -76, 43, -70],
  gom: [39, -73, 47, -63], sj: [28, -83, 32, -80],
  le: [40, -85, 44, -78], lmh: [40, -89, 47, -79],
  lo: [42, -80, 45, -75], ls: [45, -93, 50, -83],
  ci: [57, -155, 63, -148]
};

function JumpToURL(i) {
  var urlstring = links[i];
  return function() { window.open(urlstring,"_blank"); };
}

function JumpToURL2(url) {
  return function () { window.open(url,"_blank"); };
}

// "main function" of this Javascript program
function mapit() {
  latitude = 43.25; // move the map by N or S
  longitude = -106.05000;  // move the map by E or W
  zoom_ofs = 4;
  initialize_ofsmap();
} // end of function mapit

// Set up the map
function initialize_ofsmap() {
  let url_zip = "";
  map = L.map('map').setView([latitude,longitude],zoom_ofs);
  var geo = L.geoJson({features:[]},{onEachFeature:function popUp(f,l){
     var out = [];
     if (f.properties){
       for(var key in f.properties){
         out.push(key+": "+f.properties[key]);
       }
       //l.bindPopup(out.join("<br />"));  DISABLED THE POP-UP DISPLAY OF OFS INFORMATION
     }
  },
  style: { color: "#3B5323" }
  }).addTo(map);
  L.esri.basemapLayer('Oceans').addTo(map);
  //L.esri.basemapLayer('OceansLabels').addTo(map);
  // Get a Shapefile for creating polygons of the individual OFS grids
  if (location.hostname == "dev.tidesandcurrents.noaa.gov") {
    url_zip = "https://dev.tidesandcurrents.noaa.gov/ofs/OFS_MODELS_2024.zip";
  } else if (location.hostname == "uat.tidesandcurrents.noaa.gov") {
    url_zip = "https://uat.tidesandcurrents.noaa.gov/ofs/OFS_MODELS_2024.zip";
  } else {
    url_zip = "https://tidesandcurrents.noaa.gov/ofs/OFS_MODELS_2024.zip";
  }

  shp(url_zip).then(function(data){
    geo.addData(data);
  },function(a){console.log(a)});
  create_ofs_markers();
  create_mcf_markers();
  ofs_station_layer = L.layerGroup().addTo(map);
  map.on('zoomend moveend', update_ofs_stations);
  update_ofs_stations();
} // end of function initialize_ofsmap

// Keep existing overview markers; show station pins only at regional zoom.
function update_ofs_stations() {
  if (map.getZoom() < ofs_station_min_zoom) {
    ofs_station_layer.clearLayers();
    return;
  }
  var bounds = map.getBounds();
  Object.keys(ofs_station_regions).forEach(function(region) {
    var box = ofs_station_regions[region];
    if (!bounds.intersects(L.latLngBounds([box[0], box[1]], [box[2], box[3]]))) return;
    var cached = ofs_station_cache[region];
    if (!cached || (cached.retryAfter && Date.now() >= cached.retryAfter)) {
      load_ofs_stations(region);
    }
  });
  // Reuse marker instances so panning does not recreate labels/listeners.
  Object.keys(ofs_station_cache).forEach(function(region) {
    (ofs_station_cache[region].markers || []).forEach(function(marker) {
      if (bounds.contains(marker.getLatLng())) {
        if (!ofs_station_layer.hasLayer(marker)) ofs_station_layer.addLayer(marker);
      } else {
        ofs_station_layer.removeLayer(marker);
      }
    });
  });
}

function load_ofs_stations(region) {
  var cached = ofs_station_cache[region] = {markers: [], loading: true};
  var environment = location.hostname == 'dev.tidesandcurrents.noaa.gov' ? 'dev' :
    (location.hostname == 'uat.tidesandcurrents.noaa.gov' ? 'uat' : 'prod');
  var url = 'https://api.tidesandcurrents.noaa.gov/mdapi/' + environment +
    '/webapi/stations.json?type=' + region + 'ofs&expand=ofsmapoffsets';
  function failed() {
    cached.loading = false;
    cached.retryAfter = Date.now() + 30000;
    console.warn('Unable to load OFS stations for ' + region + '; pan or zoom after 30 seconds to retry.');
  }
  $.ajax({url: url, dataType: 'json', timeout: 15000}).done(function(data) {
    if (!data || !Array.isArray(data.OFSStationList) || !data.OFSDisseminationStatus) {
      failed();
      return;
    }
    cached.loading = false;
    if (data.OFSDisseminationStatus.diss_status != 'off') {
      cached.markers = create_ofs_station_markers(data.OFSStationList, region);
    }
    // Consult current zoom/bounds, not the view when the request started.
    update_ofs_stations();
  }).fail(failed);
}

function create_ofs_station_markers(stations, region) {
  var seen = {};
  var result = [];
  var icon = L.icon({iconUrl: '/images/redpushpin.png', iconSize: [14,26],
    iconAnchor: [7,26], labelAnchor: [0,0]});
  stations.forEach(function(station) {
    if (station.lat == null || station.lng == null ||
        String(station.lat).trim() === '' || String(station.lng).trim() === '') return;
    var lat = Number(station.lat), lng = Number(station.lng);
    if (!isFinite(lat) || !isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return;
    var name = String(station.OFSStationName || 'OFS station');
    var id = station.stationID == null ? '' : String(station.stationID).trim();
    // Missing IDs and multiple subdomains must not merge distinct locations.
    var key = JSON.stringify([id, name, lat, lng]);
    if (seen[key]) return;
    seen[key] = true;
    var subdomains = String(station.subdomain || '0').split('_').filter(function(sub) {
      return sub.trim() !== '';
    });
    var subdomain = subdomains.length ? subdomains[0].trim() : '0';
    var url = '/ofs/ofs_station.html?stname=' + encodeURIComponent(name) +
      '&ofs=' + encodeURIComponent(region) + '&stnid=' + encodeURIComponent(id || (region == 'ssc' ? '' : 'NULL')) +
      '&subdomain=' + encodeURIComponent(subdomain);
    var marker = L.marker([lat, lng], {icon: icon, title: name});
    marker.on('click', JumpToURL2(url));
    // bindLabel accepts HTML; escape metadata while preserving literal names.
    var label = name.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    marker.bindLabel(label, {noHide: false, direction: 'right', offset: [10,-30], clickable: true});
    marker.label.on('click', JumpToURL2(url));
    result.push(marker);
  });
  return result;
}

// The function create_ofs_markers is used to display blue icons to
// represent the OFS location.  The users can click on them to
// have the main OFS web page redirecting to the selected OFS web page.
function create_ofs_markers() {
  var ofs_info = new Array();

  var obj = new Object();
  obj.title = "Northern Gulf of America OFS";
  obj.lat = 29.78686;
  obj.lon = -93.3481;
  obj.x = 10;
  obj.y = -30;
  obj.url = "/ofs/ngofs2/ngofs.html";
  ofs_info[0] = obj;

  var obj = new Object();
  obj.title = "San Francisco Bay OFS";
  obj.lat = 37.812189;
  obj.lon = -122.7;
  obj.x = 10;
  obj.y = -30;
  obj.url = "/ofs/sfbofs/sfbofs.html";
  ofs_info[1] = obj;

  var obj = new Object();
  obj.title = "West Coast OFS";
  obj.lat = 35.0;
  obj.lon = -124.75;
  obj.x = 10;
  obj.y = -30;
  obj.url = "/ofs/wcofs/wcofs.html";
  ofs_info[2] = obj;

  var obj = new Object();
  obj.title = "Salish Sea and Columbia River OFS";
  obj.lat = 46.217852;
  obj.lon = -123.52;
  obj.x = 10;
  obj.y = -30;
  obj.url = "/ofs/sscofs/sscofs.html";
  ofs_info[3] = obj;

  var obj = new Object();
  obj.title = "Chesapeake Bay OFS";
  obj.lat = 38.25;
  obj.lon = -76.05000;
  obj.x = 10;
  obj.y = -30;
  obj.url = "/ofs/cbofs/cbofs.html";
  ofs_info[4] = obj;

  var obj = new Object();
  obj.title = "Tampa Bay OFS";
  obj.lat = 27.5615;
  obj.lon = -82.595;
  obj.x = -120;
  obj.y = -30;
  obj.url = "/ofs/tbofs/tbofs.html";
  ofs_info[5] = obj;

  var obj = new Object();
  obj.title = "Delaware Bay OFS";
  obj.lat = 39.461456;
  obj.lon = -75.137334;
  obj.x = 10;
  obj.y = -30;
  obj.url = "/ofs/dbofs/dbofs.html";
  ofs_info[6] = obj;

  var obj = new Object();
  obj.title = "New York - New Jersey OFS";
  obj.lat = 40.696;
  obj.lon = -73.95;
  obj.x = 10;
  obj.y = -30;
  obj.url = "/ofs/nyofs/nyofs.html";
  ofs_info[7] = obj;

  var obj = new Object();
  obj.title = "Gulf of Maine OFS";
  obj.lat = 42.5;
  obj.lon = -69.0;
  obj.x = 10;
  obj.y = -30;
  obj.url = "/ofs/gomofs/gomofs.html";
  ofs_info[8] = obj;

  var obj = new Object();
  obj.title = "St Johns River OFS";
  obj.lat = 30.01;
  obj.lon = -81.55;
  obj.x = 10;
  obj.y = -30;
  obj.url = "/ofs/sjofs/sjofs.html";
  ofs_info[9] = obj;

  var obj = new Object();
  obj.title = "Lake Erie OFS";
  obj.lat = 42.2;
  obj.lon = -81.1;
  obj.x = 10;
  obj.y = -30;
  obj.url = "/ofs/leofs/leofs.html";
  ofs_info[10] = obj;

  var obj = new Object();
  obj.title = "Lake Michigan and Huron OFS";
  obj.lat = 45.996705;
  obj.lon = -84.443359;
  obj.x = 10;
  obj.y = -30;
  obj.url = "/ofs/lmhofs/lmhofs.html";
  ofs_info[11] = obj;

  var obj = new Object();
  obj.title = "Lake America OFS";
  obj.lat = 43.675;
  obj.lon = -78.024;
  obj.x = 10;
  obj.y = -30;
  obj.url = "/ofs/loofs/loofs.html";
  ofs_info[12] = obj;

  var obj = new Object();
  obj.title = "Lake Superior OFS";
  obj.lat = 47.48;
  obj.lon = -88.20;
  obj.x = 10;
  obj.y = -30;
  obj.url = "/ofs/lsofs/lsofs.html";
  ofs_info[13] = obj;

  var obj = new Object();
  obj.title = "Cook Inlet OFS";
  obj.lat = 59.20;
  obj.lon = -152;
  obj.x = 10;
  obj.y = -30;
  obj.url = "/ofs/ciofs/ciofs.html";
  ofs_info[14] = obj;

  var blueIcon = L.icon({
    iconUrl: '/ofs/images/blue_icon.png',
    iconSize: [14,26],
    iconAnchor: [7,26],
    labelAnchor: [0,0]
  });

  ofs_markers = new Array(ofs_info.length);
  for (var i = 0; i < ofs_info.length; i++) {
    var lat2 = ofs_info[i].lat;
    var lon2 = ofs_info[i].lon;
      ofs_markers[i] = L.marker([lat2, lon2], {
        icon: blueIcon
      });
      var link = ofs_info[i].url;
      ofs_markers[i].on('click', JumpToURL2(link));
      var title = ofs_info[i].title;
      var xx = ofs_info[i].x;
      var yy = ofs_info[i].y;
      ofs_markers[i].bindLabel(title, {
        noHide: false,
        direction: 'right',
        offset: [eval(xx),eval(yy)],
        clickable: true});
      ofs_markers[i].label.on('click', JumpToURL2(link));
      ofs_markers[i].addTo(map);
  } // end of for
} // end of function create_ofs_markers

// The function create_mcf_markers is used to display red icons to
// represent the MCF location.  The users can click on them to
// have the main OFS/MCF web page redirecting to the selected MCF web page.
function create_mcf_markers() {
  var mcf_info = new Array();

  var obj = new Object();
  obj.title = "Tampa Bay Marine Channels Forecast";
  obj.lat = 27.5615;
  obj.lon = -82.0; //-82.595
  obj.x = 10;
  obj.y = -30;
  obj.url = "/ofs/tbofs/tbmcf.html";
  mcf_info[0] = obj;

  var obj = new Object();
  obj.title = "Mobile Bay Marine Channels Forecast";
  obj.lat = 30.439;
  obj.lon = -88.010;
  obj.x = -60;
  obj.y = -60;
  obj.url = "/ofs/ngofs2/mbmcf.html";
  mcf_info[1] = obj;

  var redIcon = L.icon({
    iconUrl: '/ofs/images/red_icon.png',
    iconSize: [14,26],
    iconAnchor: [7,26],
    labelAnchor: [0,0]
  });

  mcf_markers = new Array(mcf_info.length);
  for (var i = 0; i < mcf_info.length; i++) {
    var lat2 = mcf_info[i].lat;
    var lon2 = mcf_info[i].lon;
      mcf_markers[i] = L.marker([lat2, lon2], {
        icon: redIcon
      });
      var link = mcf_info[i].url;
      mcf_markers[i].on('click', JumpToURL2(link));
      var title = mcf_info[i].title;
      var xx = mcf_info[i].x;
      var yy = mcf_info[i].y;
      mcf_markers[i].bindLabel(title, {
        noHide: false,
        direction: 'right',
        offset: [eval(xx),eval(yy)],
        clickable: true});
      mcf_markers[i].label.on('click', JumpToURL2(link));
      mcf_markers[i].addTo(map);
  } // end of for
} // end of function create_mcf_markers

function setBasemap(basemap) {
  if (map_layer) {
    map.removeLayer(map_layer);
  }

  map_layer = L.esri.basemapLayer(basemap);
  map.addLayer(map_layer);

  if (map_labels) {
    map.removeLayer(map_labels);
  }

  if (basemap === 'NationalGeographic'
   || basemap === 'Oceans'
   //|| basemap === 'Gray'
  // || basemap === 'DarkGray'
  // || basemap === 'Imagery'
  // || basemap === 'Terrain'
 ) {
    map_labels = L.esri.basemapLayer(basemap + 'Labels');
    map.addLayer(map_labels);
  }
}

function changeBasemap(basemaps){
  var basemap = basemaps.value;
  setBasemap(basemap);
} // end of function changeBasemap
//*****************************************************************************
// END OF JAVASCRIPT PROGRAM display_ofsmap.js
