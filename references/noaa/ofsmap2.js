//*****************************************************************************
// JAVASCRIPT PROGRAM NAME: ofsmap2.js 
//
// PURPOSE: To display the red pins with station name labels on the ESRI map.
//          Use MDAPI to obtain the selected OFS region JSON output of the
//          OFS station information.
//
//          This version is for using latest version Leaflet JS, 1.9.4
//
// AUTHOR: John Cassidy
//         NOAA/NOS/CO-OPS/ISD
//         October 4, 2019
//
// LIMITATION: This Javascript script supports the ESRI ArcGIS maps only.
//
// MODIFICATION HISTORY:
//   09/02/26 - TAC : Changed 'Lake Ontario' to 'Lake America'
//   03/20/25 - TAC-4170: Updated for new Leaflet version
//   02/28/25 - TAC-4144: Changed 'Gulf of Mexico' to 'Gulf of America'
//   07/24/24 - TAC-3953: Added the codes to capitalize the first character and lowercase
//                        rest of the characters in the word; Added codes to handle the third
//                        subdomain data
//   04/25/24 - TAC-3859: Added Salish Sea and Columbia River OFS
//   06/16/22 - TAC-3375: Renamed from ofsmap_json.js to ofsmap.js; Modified for
//                        using the MDAPI to get the OFS station information data
//                        in the JSON format.
//   10/05/21 - TAC-3174: Added the West Coast subdomain pins (forgot to add "wc"
//                        in function get_stations_data to call function
//                        create_subdomain_markers)
//
//*****************************************************************************
var latitude = null;
var longitude = null;
var zoom_ofs = null;
var markers = null;
var links = new Array();
var map = null;
var subdomain_markers = null;

function JumpToURL(i) {
  var urlstring = links[i];
  return function() { window.open(urlstring,"_blank"); };
}
//*****************************************************************************
function JumpToURL2(url) {
  return function () { window.open(url,"_blank"); };
}
//*****************************************************************************
// "main function" of this Javascript program
function mapit(region,subdomain) {
  if (subdomain == null || subdomain == "") { subdomain = "0"; }
  switch (region) {
    case "cb": // Chesapeake Bay OFS
      latitude = 38.25;
      longitude = -76.05000;
      zoom_ofs = 9;
      break;
    case "tb": // Tampa Bay OFS
      latitude = 27.5615;
      longitude = -82.595;
      zoom_ofs = 11;
      break;
    case "db": // Delaware Bay OFS
      latitude = 39.461456;
      longitude = -75.137334;
      zoom_ofs = 9;
      break;
    case "ny": // New York/New Jersey OFS
      latitude = 40.696;
      longitude = -73.95;
      zoom_ofs = 11;
      break;
    case "gb": // Galveston Bay OFS
      latitude = 29.48;
      longitude = -94.80;
      zoom_ofs = 10;
      break;
    case "gom": // Gulf of Maine (GoMOFS)
      latitude = 42.5;
      longitude = -69.0;
      zoom_ofs = 8;
      break;
    case "sj": // St. John's River OFS
      latitude = 30.01;
      longitude = -81.55;
      zoom_ofs = 11;
      break;
    case "le": // Lake Erie OFS
      latitude = 42.2;
      longitude = -81.1;
      zoom_ofs = 8;
      break;
    case "lh": // Lake Huron OFS
      latitude = 44.75;
      longitude = -82.42;
      zoom_ofs = 7;
      break;
    case "lm": // Lake Michigan
      latitude = 43.946;
      longitude = -86.441;
      zoom_ofs = 7;
      break;
    case "lo": // Lake America
      latitude = 43.675;
      longitude = -78.024;
      zoom_ofs = 8;
      break;
    case "ls": // Lake Superior
      latitude = 47.48;
      longitude = -88.20;
      zoom_ofs = 7;
      break;
    case "lmh": // Lake Michigan and Huron (LMHOFS)
      latitude = 43.996705;
      longitude = -84.443359;
      zoom_ofs = 7;
      break;
    case "ng": // Northern Gulf of America (NGOFS)
      if (subdomain == "0") {
        latitude = 28.459033;
        longitude = -92.2860549;
        zoom_ofs = 7;
      } else if (subdomain == "gp") { // Gulfport
        latitude = 30.287532;
        longitude = -89.03329;
        zoom_ofs = 11;
      } else if (subdomain == "mb") { // Mobile Bay
        latitude = 30.439;
        longitude = -88.010;
        zoom_ofs = 10;
      } else if (subdomain == "ps") { // Pascagula
        latitude = 30.244;
        longitude = -88.585;
        zoom_ofs = 11;
      } else if (subdomain == "gb") { // Galveston Bay
        latitude = 29.35;
        longitude = -94.80;
        zoom_ofs = 10;
      } else if (subdomain == "ma") { // Matagorda Bay
        latitude = 28.4745;
        longitude = -96.171;
        zoom_ofs = 10;
      } else if (subdomain == "sn") { // Sabine Neches
        latitude = 29.8475;
        longitude = -93.8635;
        zoom_ofs = 11;
      } else if (subdomain == "cc") { // Calc/Lake Charles
        latitude = 29.8418;
        longitude = -93.361;
        zoom_ofs = 10;
      } else if (subdomain == "co") { // Corpus Christi
        latitude = 27.79;
        longitude = -97.25;
        zoom_ofs = 11;
      } else if (subdomain == "lp") { // Lake Pontchartrain
        latitude = 30.175998;
        longitude = -90.147371;
        zoom_ofs = 10;
      }
      break;
    case "cre": // Columbia River and Estuary OFS (CREOFS)
      if (subdomain == "of") { // CREOFS - Offshore Domain 46.625
        latitude = 46.825;
        longitude = -124.625;
        zoom_ofs = 8;
      } else if (subdomain == "lo") { // CREOFS - LCR Domain -123.6775
        latitude = 46.255;
        longitude = -123.82;
        zoom_ofs = 11;
      } else if (subdomain == "up") {
        latitude = 45.65;
        longitude = -122.45;
        zoom_ofs = 10;
      } else if (subdomain == "ba") {
        latitude = 46.255;
        longitude = -124.21;
        zoom_ofs = 11;
      } else if (subdomain == "mi") {
        latitude = 46.15;
        longitude = -123.2;
        zoom_ofs = 10;
      } else {
        latitude = 46.000652;
        longitude = -123.680273;
        zoom_ofs = 9;
      }
      break;
    case "sfb": // San Francisco Bay OFS (SFBOFS)
      if (subdomain == "en") { // San Francisco Bay Entrance
        latitude = 37.811543;
        longitude = -122.372202;
        zoom_ofs = 12;
      } else if (subdomain == "la") { // Large SF
        latitude = 37.85;
        longitude = -122.335;
        zoom_ofs = 10;
      } else {
        latitude = 37.8;
        longitude = -122.4;
        zoom_ofs = 11;
      }
      break;
    case "ci": // Cook Inlet OFS
      if (subdomain == "ub") { // Upper Bay}
        latitude = 61.126;
        longitude = -150.445;
        zoom_ofs = 9;
      } else {
        latitude = 59.20;
        longitude = -152;
        zoom_ofs = 7;
      }
      break;
    case "wc": // West Coast OFS (WCOFS)
      if (subdomain == "wa") { // Washington State
        latitude = 45.5;
        longitude = -125.5;
        zoom_ofs = 7;
      } else if (subdomain == "cno") { // Central and Northern Oregon
        latitude = 44.5;
        longitude = -124.9;
        zoom_ofs = 8;
      } else if (subdomain == "cab") { // Cape Blanco Area
        latitude = 42.5;
        longitude = -125.5;
        zoom_ofs = 9;
      } else if (subdomain == "cam") { // Cape Mendocino Area
        latitude = 41.15;
        longitude = -125.3;
        zoom_ofs = 9;
      } else if (subdomain == "nca") { // Northern CA
        latitude = 39.675;
        longitude = -123.5;
        zoom_ofs = 8;
      } else if (subdomain == "cca") { // Central CA
        latitude = 36.0;
        longitude = -121.5;
        zoom_ofs = 9;
      } else if (subdomain == "sca") { // Southern CA
        latitude = 34.75;
        longitude = -120.25;
        zoom_ofs = 7;
      } else {
        latitude = 41.6;
        longitude = -125.125; 
        zoom_ofs = 6;
      }
      break;
    case "ssc": // Salish Sea and Columbia River OFS (SSCOFS)
      if (subdomain == "of") { // SSCOFS - Offshore
        latitude = 46.25;
        longitude = -124.22;
        zoom_ofs = 11;
      } else if (subdomain == "lo") { // SSCOFS - Lower Columbia River
        latitude = 46.255;
        longitude =-123.82;
        zoom_ofs = 11;
      } else if (subdomain == "up") { // SSCOFS - Upper Columbia River
        latitude = 45.65;
        longitude = -122.45;
        zoom_ofs = 10;
      } else if (subdomain == "mi") { // SSOCS - Middle Columbia RIver
        latitude = 46.15;
        longitude = -123.2;
        zoom_ofs = 10;
      } else if (subdomain == "sj") {  // SSCOFS - San Juan Islands
        latitude = 48.60000;
        longitude = -122.83317;
        zoom_ofs = 10;
      } else if (subdomain == "wb") { // SSCOFS - Whidbey Basin}
        latitude = 48.175;
        longitude = -122.473905;
        zoom_ofs = 10;
      } else if (subdomain == "cp") { // SSCOFS - Central Puget Sound
        latitude = 47.721535;
        longitude = -122.453862;
        zoom_ofs = 11;
      } else if (subdomain == "sp") { // SSCOFS - Southern Puget Sound
        latitude = 47.3;
        longitude = -122.713090;
        zoom_ofs = 11;
      } else if (subdomain == "jf") { // SSCOFS - Strait of Juan de Fuca
        latitude = 48.375;
        longitude = -123.85;
        zoom_ofs = 10;
      } else {
        latitude = 46.884235;
        longitude = -122.961426;
        zoom_ofs = 8;
      }
      break;
  } // end of switch
  initialize_ofsmap(region,subdomain);
} // end of function mapit
//*****************************************************************************
function initialize_ofsmap(region,subdomain) {
  var mdapi_url; 
  if (location.hostname == "dev.tidesandcurrents.noaa.gov") {
    mdapi_url = "https://api.tidesandcurrents.noaa.gov/mdapi/dev/webapi/stations.json?type="+in_ofs_region+"ofs&expand=ofsmapoffsets";
  } else if (location.hostname == "uat.tidesandcurrents.noaa.gov") {
    mdapi_url = "https://api.tidesandcurrents.noaa.gov/mdapi/uat/webapi/stations.json?type="+in_ofs_region+"ofs&expand=ofsmapoffsets";
  } else {
    mdapi_url = "https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations.json?type="+in_ofs_region+"ofs&expand=ofsmapoffsets";
  }
  $.getJSON(mdapi_url, function (jsondata,status) {
    if (jsondata) {
      get_stations_data(jsondata,region,subdomain,map);
    }
  })
} // end of function initialize_ofsmap
//*****************************************************************************
function get_stations_data(jsondata,region,subdomain) {
  map = L.map('map', {minZoom: 5, maxZoom: 13}).setView([latitude,longitude],zoom_ofs);

  // Option #1 - Non ESRI map
  //const tiles = L.tileLayer('https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}', {	maxZoom: 20,
  //  attribution: 'Tiles courtesy of the <a href="https://usgs.gov/">U.S. Geological Survey</a>'}).addTo(map);

  // Option #2 - ESRI map (no names)
  //const tiles = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}', {
  //  attribution: 'Tiles &copy; Esri &mdash; Sources: GEBCO, NOAA, CHS, OSU, UNH, CSUMB, National Geographic, DeLorme, NAVTEQ, and Esri',
  //  maxZoom: 13}).addTo(map);

  map.createPane("world_ocean_base");
  map.createPane("world_ocean_ref");

  const worldOceanBase = L.esri.tiledMapLayer({url: "https://services.arcgisonline.com/arcgis/rest/services/Ocean/World_Ocean_Base/MapServer",
    pane: "world_ocean_base"});

  // // World Ocean Reference from ArcGIS Online - [Vector Tile Layer/ vector tile service]
  // https://www.arcgis.com/home/item.html?id=94329802cbfa44a18f423e6f1a0b875c   -- World Ocean Reference
  // https://www.arcgis.com/home/item.html?id=6061e78281f94bb6a671d11253d41f6e   -- World Ocean Reference (US Edition) for EO
  const worldOceanRef = L.esri.Vector.vectorTileLayer("6061e78281f94bb6a671d11253d41f6e", {pane: "world_ocean_ref"});

  // Create layer group using the 2 layers to display as Ocean basemap
  const us_edition_ocean = L.layerGroup([worldOceanRef, worldOceanBase]).addTo(map);

  //console.log(L,L.esri);
  var RedPin_Icon = L.icon({
     iconUrl: '/images/redpushpin.png',
     iconSize: [14,26],
     iconAnchor: [7,26],
     labelAnchor: [0,0]
  });
  // First, get the OFS dissemination per data type
  var ofs_dissemination_data = jsondata.OFSDisseminationStatus;
  var dissemination_status = 1;
  if (ofs_dissemination_data.diss_status == "off") { dissemination_status = 0; }

  if (dissemination_status) {
    var data_length = jsondata.OFSStationList.length;
    //console.log("data_length: " + data_length);
    if (data_length >= 1) {
      ofs_stations_data = jsondata.OFSStationList;
      markers = new Array(data_length);
      for (var i = 0; i < data_length; i++) {
        station_id = ofs_stations_data[i].stationID;
        if (station_id == null || station_id == " ") {
          if (region == "ssc") {
            station_id = "";
          } else {
            station_id = "NULL";
          }
        }
        //console.log("station ID: " + station_id);
        var in_subdomain = ofs_stations_data[i].subdomain;
        var test_sub = in_subdomain.match(/_/g);
        var res = "";
        var sub = "";
        var sub2 = "";
        var sub3rd_status = 0;
        if (test_sub == "_" || test_sub == "_,_") { // If this station is used in 2 or 3 subdomains
          res = in_subdomain.split("_");
          in_subdomain = res[0];
          sub = res[1];
          if (test_sub == "_,_") {
            sub2 = res[2];
            sub3rd_status = 1;
          }
        } else { sub = ""; }
        var matched = 0; // 0 = false; 1 = true
        if (in_subdomain == subdomain) {
          matched = 1;
        } else if (sub == subdomain) {
          matched = 1;
        } else if (sub3rd_status && sub2 == subdomain) {
          matched = 1;
        }
        if (matched) {
          var commonname = ofs_stations_data[i].OFSStationName;
          //commonname = fix_stationname(commonname);
          //console.log("%j",ofs_stations_data[i]);
          if (ofs_stations_data[i].ofsmapoffsets != null) {
            x_off = ofs_stations_data[i].ofsmapoffsets['xOffset'];
            y_off = ofs_stations_data[i].ofsmapoffsets['yOffset'];
          } else {
            x_off = 10;
            y_off = -30;
          }
          var lat = ofs_stations_data[i].lat;
          var lng = ofs_stations_data[i].lng;
          if (commonname != null) {
            let re = /\"/gi;
            var new_stationname = commonname.replace(re,'%27');
          }
          links[i] = "/ofs/ofs_station.html?stname=" + new_stationname + "&ofs=" + region + "&stnid=" + station_id + "&subdomain=" + subdomain;
          markers[i] = L.marker([lat, lng], {
            icon: RedPin_Icon
          });
          link = links[i];
          markers[i].on('click', JumpToURL(i));
          if (x_off > 0) {
            dir_label = 'right';
          } else if (x_off == 0) {
            dir_label = 'center';
          } else {
            dir_label = 'left';
          }
          markers[i].bindTooltip(commonname, {
            permanent: true,
            direction: dir_label,
            offset: [eval(x_off),eval(y_off)],
            interactive: true }).addTo(map);
        } // end of if in_subdomain == subdomain
      } // end of for
    } // end of if data_length > 1
  } // end of if dissemination_status
  if ((region == "ng" || region == "cre" || region == "sfb" || region == "wc" || region == "ssc") && subdomain == "0") {
    create_subdomain_markers(region);
  }
} // end of function get_stations_data
//*****************************************************************************
function labelCase(str) {
  str = str.toLowerCase().split(' ');
  for (var i = 0; i < str.length; i++) {
    str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1); 
  }
  return str.join(' ');
}
//*****************************************************************************
// Function Name: fix_stationname
//
// Purpose: To capitalize the first character and lowercase rest of the word after
//          the first character
//
// Note: This function is hold for now because of it will modify the capitalized word
//       like 'CBBT', 'CBIBS', etc. to 'Cbbt', 'Cbibs' which is not corrected. Need
//       to research more
//*******************************************************************************
function fix_stationname(station_name) {
  return station_name.replace(/\w\S*/g,
    text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase());
} // end of function fix_stationname
//*****************************************************************************
// The function create_subdomain_markers is used to display blue icons to
// represent the NGOFS subdomain location.  The users can click on them to
// have the NGOFS web page redirecting to the NGOFS subdomain web page.
function create_subdomain_markers(region) {
  var subdomain_info = new Array();
  var obj = new Object();

// For Northern Gulf of America OFS subdomain markers
  if (region == "ng") {
    var obj = new Object();
    obj.title = "<span style='font-size:16px'><strong>Calcasieu - Lake Charles Subdomain</strong></span>";
    obj.lat = 29.78686;
    obj.lon = -93.3481;
    obj.x = -110;
    obj.y = -45;
    obj.url = "/ofs/ngofs2/ngofs_lakecharles.html";
    subdomain_info[0] = obj;

    var obj = new Object();
    obj.title = "<span style='font-size:16px'><strong>Galveston Bay Subdomain</strong></span>";
    obj.lat = 29.492206;
    obj.lon = -94.883423;
    obj.x = -180;
    obj.y = -45;
    obj.url = "/ofs/ngofs2/ngofs_galveston.html";
    subdomain_info[1] = obj;

    var obj = new Object();
    obj.title = "<span style='font-size:16px'><strong>Gulfport Subdomain</strong></span>";
    obj.lat = 30.415519;
    obj.lon = -89.093628;
    obj.x = -110;
    obj.y = -45;
    obj.url = "/ofs/ngofs2/ngofs_gulfport.html";
    subdomain_info[2] = obj;

    var obj = new Object();
    obj.title = "<span style='font-size:16px'><strong>Matagorda Bay Subdomain</strong></span>";
    obj.lat = 28.4803;
    obj.lon = -96.3116;
    obj.x = 10;
    obj.y = -30;
    obj.url = "/ofs/ngofs2/ngofs_matagorda.html";
    subdomain_info[3] = obj;

    var obj = new Object();
    obj.title = "<span style='font-size:16px'><strong>Mobile Bay Subdomain</strong></span>";
    obj.lat = 30.68812;
    obj.lon = -88.05542;
    obj.x = -110;
    obj.y = -45;
    obj.url = "/ofs/ngofs2/ngofs_mobile.html";
    subdomain_info[4] = obj;

    var obj = new Object();
    obj.title = "<span style='font-size:16px'><strong>Pascagoula Bay Subdomain</strong></span>";
    obj.lat = 30.420256;
    obj.lon = -88.560791;
    obj.x = -120;
    obj.y = -45;
    obj.url = "/ofs/ngofs2/ngofs_pascagoula.html";
    subdomain_info[5] = obj;

    var obj = new Object();
    obj.title = "<span style='font-size:16px'><strong>Sabine Neches Subdomain</strong></span>";
    obj.lat = 29.7081;
    obj.lon = -93.848;
    obj.x = -110;
    obj.y = -45;
    obj.url = "/ofs/ngofs2/ngofs_sabine.html";
    subdomain_info[6] = obj;

    var obj = new Object();
    obj.title = "<span style='font-size:16px'><strong>Corpus Christi Subdomain</strong></span>";
    obj.lat = 27.802596;
    obj.lon = -97.299333;
    obj.x = -10;
    obj.y = -45;
    obj.url = "/ofs/ngofs2/ngofs_corpus.html";
    subdomain_info[7] = obj;

    var obj = new Object();
    obj.title = "<span style='font-size:16px'><strong>Lake Pontchartrain Subdomain";
    obj.lat = 30.175998;
    obj.lon = -90.147371;
    obj.x = -130;
    obj.y = -45;
    obj.url = "/ofs/ngofs2/ngofs_lakepont.html";
    subdomain_info[8] = obj;

// For San Francisco Bay OFS subdomain markers
  } else if (region == "sfb") {
    var obj = new Object();
    obj.title = "San Francisco Bay Entrance Subdomain";
    obj.lat = 37.812189;
    obj.lon = -122.46;
    obj.x = 10;
    obj.y = -30;
    obj.url = "/ofs/sfbofs/sfbofs_entrance.html";
    subdomain_info[0] = obj;

    var obj = new Object();
    obj.title = "San Francisco Bay Subdomain";
    obj.lat = 37.812189;
    obj.lon = -122.7;
    obj.x = -200;
    obj.y = -30;
    obj.url = "/ofs/sfbofs/sfbofs_large.html";
    subdomain_info[1] = obj;

// For West Coast subdomain region
  } else if (region == "wc") {
    var obj = new Object();
    obj.title = "Washington and Oregon Subdomain";
    obj.lat = 45.5;
    obj.lon = -125.5;
    obj.x = 10;
    obj.y = -30;
    obj.url = "/ofs/wcofs/wcofs_washington.html";
    subdomain_info[0] = obj;

    var obj = new Object();
    obj.title = "Northern California Subdomain";
    obj.lat = 38.0;
    obj.lon = -123.5;
    obj.x = 10;
    obj.y = -30;
    obj.url = "/ofs/wcofs/wcofs_northernca.html";
    subdomain_info[1] = obj;

    var obj = new Object();
    obj.title = "Southern California Subdomain";
    obj.lat = 33.5;
    obj.lon = -118.8;
    obj.x = 10;
    obj.y = -30;
    obj.url = "/ofs/wcofs/wcofs_southernca.html";
    subdomain_info[2] = obj;

// For Columbia River and Estuary OFS subdomain region
  } else if (region == "cre") {
    var obj = new Object();
    obj.title = "Offshore Columbia River Subdomain";
    obj.lat = 46.255;
    obj.lon = -124.7
    obj.x = 10;
    obj.y = -30;
    obj.url = "/ofs/creofs/creofs_offshore.html";
    subdomain_info[0] = obj;

    var obj = new Object();
    obj.title = "Lower Columbia River Subdomain";
    obj.lat = 46.217852;
    obj.lon = -123.52;
    obj.x = 10;
    obj.y = -30;
    obj.url = "/ofs/creofs/creofs_lower.html";
    subdomain_info[1] = obj;

    var obj = new Object();
    obj.title = "Upper Columbia River Subdomain";
    obj.lat = 45.600587;
    obj.lon = -122.637634;
    obj.x = 10;
    obj.y = -30;
    obj.url = "/ofs/creofs/creofs_upper.html";
    subdomain_info[2] = obj;

    var obj = new Object();
    obj.title = "Middle Columbia River Subdomain";
    obj.lat = 46.15;
    obj.lon = -123.2;
    obj.x = 10;
    obj.y = -30;
    obj.url = "/ofs/creofs/creofs_middle.html";
    subdomain_info[3] = obj;

    var obj = new Object();    
    obj.title = "Columbia River Bar Entrance Subdomain";
    obj.lat = 46.255;
    obj.lon = -124.0;
    obj.x = 10;
    obj.y = -50;
    obj.url = "/ofs/creofs/creofs_bar.html";
    subdomain_info[4] = obj;

// For Salish Sea and Columbia River OFS subdomain region
  } else if (region == "ssc") {
    var obj = new Object();
    obj.title = "Offshore Columbia River Subdomain";
    obj.lat = 46.255;
    obj.lon = -124.7
    obj.x = -240;
    obj.y = -30;
    obj.url = "/ofs/sscofs/sscofs_offshore.html";
    subdomain_info[0] = obj;

    var obj = new Object();
    obj.title = "Lower Columbia River Subdomain";
    obj.lat = 46.217852;
    obj.lon = -123.52;
    obj.x = 10;
    obj.y = -50;
    obj.url = "/ofs/sscofs/sscofs_lower.html";
    subdomain_info[1] = obj;

    var obj = new Object();
    obj.title = "Upper Columbia River Subdomain";
    obj.lat = 45.600587;
    obj.lon = -122.637634;
    obj.x = 10;
    obj.y = -30;
    obj.url = "/ofs/sscofs/sscofs_upper.html";
    subdomain_info[2] = obj;

    var obj = new Object();
    obj.title = "Middle Columbia River Subdomain";
    obj.lat = 46.15;
    obj.lon = -123.2;
    obj.x = 10;
    obj.y = -30;
    obj.url = "/ofs/sscofs/sscofs_middle.html";
    subdomain_info[3] = obj;

    var obj = new Object();
    obj.title = "San Juan Island Subdomain";
    obj.lat = 48.6000;
    obj.lon = -122.83317;
    obj.x = 10;
    obj.y = -30;
    obj.url = "/ofs/sscofs/sscofs_sanjuan.html";
    subdomain_info[4] = obj;

    var obj = new Object();
    obj.title = "Whidbey Basin Subdomain";
    obj.lat = 48.175;
    obj.lon = -122.473905;
    obj.x = 10;
    obj.y = -30;
    obj.url = "/ofs/sscofs/sscofs_whidbey.html";
    subdomain_info[5] = obj;

    var obj = new Object();
    obj.title = "Central Puget Sound Subdomain";
    obj.lat = 47.721535;
    obj.lon = -122.453862;
    obj.x = 10;
    obj.y = -30;
    obj.url = "/ofs/sscofs/sscofs_central_puget.html";
    subdomain_info[6] = obj;

    var obj = new Object();
    obj.title = "Southern Puget Sound Subdomain";
    obj.lat = 47.3;
    obj.lon = -122.713090;
    obj.x = -230;
    obj.y = -30;
    obj.url = "/ofs/sscofs/sscofs_southern_puget.html";
    subdomain_info[7] = obj;

    var obj = new Object();
    obj.title = "Strait of Juan de Fuca Subdomain";
    obj.lat = 48.375;
    obj.lon = -123.85;
    obj.x = 10;
    obj.y = -30;
    obj.url = "/ofs/sscofs/sscofs_straitjuan.html";
    subdomain_info[8] = obj;
  }

  var blueIcon = L.icon({
    iconUrl: '/ofs/images/blue_icon.png',
    iconSize: [14,26],
    iconAnchor: [7,26],
    labelAnchor: [0,0]
  });

  subdomain_markers = new Array(subdomain_info.length);
  for (var i = 0; i < subdomain_info.length; i++) {
    var lat2 = subdomain_info[i].lat;
    var lon2 = subdomain_info[i].lon;
      subdomain_markers[i] = L.marker([lat2, lon2], {
        icon: blueIcon
      });
      var link = subdomain_info[i].url;
      subdomain_markers[i].on('click', JumpToURL2(link));
      var title = subdomain_info[i].title;
      var xx = subdomain_info[i].x;
      var yy = subdomain_info[i].y;
      subdomain_markers[i].bindTooltip(title, {
        direction: 'right',
        offset: [eval(xx),eval(yy)],
        interactive: true }).addTo(map);
  } // end of for
} // end of function create_subdomain_markers
//*****************************************************************************
// END OF JAVASCRIPT PROGRAM ofsmap2.js