//*********************************************************************
// JAVASCRIPT PROGRAM NAME: ofslinks.js
//
// PURPOSE: To get the selected OFS location's OFS stations data from
//          MDAPI then displays the station names links and the map plots
//          animation links on the left-side menu, and the map plots
//          animation links below the ERSI map area.
//
// AUTHOR: John Cassidy
//         NOAA/NOS/CO-OPS/ISD
//         June 13, 2022
//         TAC-3375
//
// USAGE: Called by the individual OFS web pages (cbofs.html, dbofs.html, etc.)
//
// MODIFICATION HISTORY:
//   06/06/25 - TAC-4244: Modified '%27' to '' to trim out the quote character
//   08/21/24 - TAC-3826: Updated for not inserting column html code if no data
//   07/24/24 - TAC-3953: Added the codes to capitalize the first character and lowercase
//                        rest of the characters in the word; Added codes to handle the third
//                        subdomain data; Added SSCOFS stations list order (west to east)
//   10/18/22 - TAC-3458: Remove the blank column of salinity - Great Lakes OFS Regions
//                        don't have salinity.
//**********************************************************************
var ofs_stations_data, mdapi_url, ofs_station_link, mapplots_link, diss_ok, sub3rd_status = 0;
var currents_diss_stopped = salinity_diss_stopped = waterlevel_diss_stopped = watertemp_diss_stopped = wind_diss_stopped = 0;
var dissemination_status = 1; // 0 = stopped/off; 1 = operating/on (default); 2 = At least one data type stopped/off;
var subdomain_data, subdomain_url;
var stations_list = new Array();

// Map Plots Animation configuration file
var ofsmapdisplays_xml = "/ofs/ofs_animation.xml";

// Start
$(document).ready(function() {
  if (in_subdomain == null || in_subdomain == "") { in_subdomain = "0"; }

  // Set up the URL path
  if (location.hostname == "dev.tidesandcurrents.noaa.gov") {
    mdapi_url = "https://api.tidesandcurrents.noaa.gov/mdapi/dev/webapi/stations.json?type="+in_ofs_region+"ofs";
  } else if (location.hostname == "uat.tidesandcurrents.noaa.gov") {
    mdapi_url = "https://api.tidesandcurrents.noaa.gov/mdapi/uat/webapi/stations.json?type="+in_ofs_region+"ofs";
  } else {
    mdapi_url = "https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations.json?type="+in_ofs_region+"ofs";
  }

  // Get the JSON output from MDAPI
  $.getJSON(mdapi_url, function(jsondata) {
    // First, get the OFS dissemination per data type
    var ofs_dissemination_data = jsondata.OFSDisseminationStatus;
    if (ofs_dissemination_data.diss_status == "off") { dissemination_status = 0; }
    else if (ofs_dissemination_data.diss_status == "war") { dissemination_status = 2; }

    // Check if the dissemination status reports at least one data type stopped
    if (dissemination_status == 2) {
      currents_diss_stopped = ofs_dissemination_data.currents_diss.match(/(off)/g);
      salinity_diss_stopped = ofs_dissemination_data.salinity_diss.match(/(off)/g);
      waterlevel_diss_stopped = ofs_dissemination_data.waterlevel_diss.match(/(off)/g);
      watertemp_diss_stopped = ofs_dissemination_data.waterTemp_diss.match(/(off)/g);
      wind_diss_stopped = ofs_dissemination_data.wind_diss.match(/(off)/g);
    }

    if (dissemination_status) {
      // Set up the links of the individual OFS station on the TAC-OFS web page's left-side menu.
      ofs_stations_data = jsondata.OFSStationList;
      for (var i=0; i<ofs_stations_data.length; i++) {
        var station_ID = ofs_stations_data[i].stationID;
        station_ID = station_ID.trim();
        subdomain_data = ofs_stations_data[i].subdomain;
        var test_sub = subdomain_data.match(/_/g);
        var res = "";
        var sub = "";
        var sub2 = "";
        if (test_sub == "_" || test_sub == "_,_") { // If this station is used in 2 or 3 subdomains
          res = subdomain_data.split("_");
          subdomain_data = res[0];
          sub = res[1];
          if (test_sub == "_,_") {
            sub2 = res[2];
            sub3rd_status = 1;
          }
        } else { sub = ""; }
        var matched = 0; // 0 = false; 1 = true
        if (in_subdomain == subdomain_data) {
          matched = 1;
          subdomain_url = in_subdomain;
        } else if (sub == in_subdomain) {
          matched = 1;
          subdomain_url = sub;
        } else if (sub3rd_status && sub2 == in_subdomain) {
          matched = 1;
          subdomain_url = sub2;
        }
        if (matched) {
          //style=\"padding: 1px 15px;\"
          var station_name = ofs_stations_data[i].OFSStationName;
          var station_name_url = station_name;
          //station_name = fix_stationname(station_name);
          if (station_name != null) {
            let re = /\"/gi;
            station_name = station_name.replace(re,'&quot;'); // '%27' does not change to ' on the web page
            station_name_url = station_name_url.replace(re,'%27');
          }
          ofs_station_link = "<li><a href=\"/ofs/ofs_station.html?stname="+station_name_url+"&ofs="+in_ofs_region+"&stnid="+station_ID+"&subdomain="+subdomain_url+"\">"+station_name+"</a></li>";
          //$("#ofsstation_list").append(ofs_station_link);
          if ((in_ofs_region == "ng" || subdomain_url.match(/(mb|gb|ps)/g)) || (in_ofs_region == "cre" && subdomain_url.match(/(lo|mi)/g)) || 
              (in_ofs_region == "sfb" && subdomain_url.match(/(la|en)/g)) || (in_ofs_region == "ssc" && subdomain_url.match(/(lo|mi|of)/g))) {
            station_string = ofs_stations_data[i].lng + "_00_" + ofs_station_link;
          } else {
            station_string = ofs_stations_data[i].lat + "_00_" + ofs_station_link;
          }
          stations_list.push(station_string);
        }
      } // end of for ofs_stations loop

      stations_list.sort();
      stations_list.reverse();
      for (var i=0; i<stations_list.length; i++) {
        //console.log(stations_list[i]);
        station_link = stations_list[i].split("_00_",2);
        $("#ofsstation_list").append(station_link[1]);
      }
      // Get all information for the OFS map plots
      var xmlhttp = new XMLHttpRequest();
      var wl_info = new Array();
      var sal_info = new Array();
      var wt_info = new Array();
      var cu_info = new Array();
      var wind_info = new Array();
      var obj = new Object();

      xmlhttp.open('GET','/ofs/ofs_animation.xml',false);
      xmlhttp.send();
      xmlDoc = xmlhttp.responseXML;
      var ofsmapinfos = xmlDoc.documentElement.getElementsByTagName("OFS_Animation");
      for (i = 0; i < ofsmapinfos.length; i++) {
        var ofslocation = ofsmapinfos[i].getElementsByTagName("ofs_region")[0].firstChild.nodeValue;
        var ofssubdomain = ofsmapinfos[i].getElementsByTagName("subdomain")[0].firstChild.nodeValue;
        if (ofslocation == in_ofs_region && ofssubdomain == in_subdomain) {
          data_type = ofsmapinfos[i].getElementsByTagName('type')[0].firstChild.nodeValue;
          link_title = ofsmapinfos[i].getElementsByTagName('link_name')[0].firstChild.nodeValue;
          order_num = ofsmapinfos[i].getElementsByTagName('order_num')[0].firstChild.nodeValue;
          model_type = ofsmapinfos[i].getElementsByTagName('model_type')[0].firstChild.nodeValue;
          obj = new Object();
          obj.title = link_title;
          obj.file = model_type;
          if (data_type == "wl") {
            wl_info[order_num] = obj;
          } else if (data_type == "wind") {
            wind_info[order_num] = obj;
          } else if (data_type == "wt") {
            wt_info[order_num] = obj;
          } else if (data_type == "cu") {
            cu_info[order_num] = obj;
          } else {
            sal_info[order_num] = obj;
          }
        } // end of if
      } // end of for ofsmapinfos.length

      // Set up the links of individual data type of OFS Maps Plots Animation on the TAC-OFS web page's left-side menu
      diss_ok = 1;
      if (wl_info.length > 0) {
        if (dissemination_status == 2 && waterlevel_diss_stopped == 1) { diss_ok = 0; }
        if (diss_ok) {
          $("#ofsmapdisplays_list").append("<li class=\"nav-header\" style=\"color:black\">Water Level</li>");
          for (i=1; i < wl_info.length; i++) {
            mapplots_link = "<li><a href=\"/ofs/ofs_mapplots.html?ofsregion="+in_ofs_region+"&subdomain="+in_subdomain+"&model_type="+wl_info[i].file+"\">"+wl_info[i].title+"</a></li>\n";
            $("#ofsmapdisplays_list").append(mapplots_link);
          } // end of for
        } // end of if diss_ok
      } // end of if wl_info

      diss_ok = 1; // reset
      if (wind_info.length > 0) {
        if (dissemination_status == 2 && wind_diss_stopped == 1) { diss_ok = 0; }
        if (diss_ok) {
          $("#ofsmapdisplays_list").append("<li class=\"nav-header\" style=\"color:black\">Wind</li>");
          for (i=1; i < wind_info.length; i++) {
            mapplots_link = "<li><a href=\"/ofs/ofs_mapplots.html?ofsregion="+in_ofs_region+"&subdomain="+in_subdomain+"&model_type="+wind_info[i].file+"\">"+wind_info[i].title+"</a></li>\n";
            $("#ofsmapdisplays_list").append(mapplots_link);
          } // end of for
        } // end of if diss_ok
      } // end of if wind_info

      diss_ok = 1; // reset
      if (cu_info.length > 0) {
        if (dissemination_status == 2 && currents_diss_stopped == 1) { diss_ok = 0; }
        if (diss_ok) {
          $("#ofsmapdisplays_list").append("<li class=\"nav-header\" style=\"color:black\">Currents</li>");
          for (i=1; i < cu_info.length; i++) {
            mapplots_link = "<li><a href=\"/ofs/ofs_mapplots.html?ofsregion="+in_ofs_region+"&subdomain="+in_subdomain+"&model_type="+cu_info[i].file+"\">"+cu_info[i].title+"</a></li>\n";
            $("#ofsmapdisplays_list").append(mapplots_link);
          } // end of for
        } // end of if diss_ok
      } // end of if cu_info

      diss_ok = 1; // reset
      if (wt_info.length > 0) {
        if (dissemination_status == 2 && watertemp_diss_stopped == 1) { diss_ok = 0; }
        if (diss_ok) {
          $("#ofsmapdisplays_list").append("<li class=\"nav-header\" style=\"color:black\">Temperature</li>");
          for (i=1; i < wt_info.length; i++) {
            mapplots_link = "<li><a href=\"/ofs/ofs_mapplots.html?ofsregion="+in_ofs_region+"&subdomain="+in_subdomain+"&model_type="+wt_info[i].file+"\">"+wt_info[i].title+"</a></li>\n";
            $("#ofsmapdisplays_list").append(mapplots_link);
          } // end of for
        } // end of if diss_ok
      } // end of if wt_info

      diss_ok = 1; // reset
      if (sal_info.length > 0) {
        if (dissemination_status == 2 && salinity_diss_stopped == 1) { diss_ok = 0; }
        if (diss_ok) {
          $("#ofsmapdisplays_list").append("<li class=\"nav-header\" style=\"color:black\">Salinity</li>");
          for (i=1; i < sal_info.length; i++) {
            mapplots_link = "<li><a href=\"/ofs/ofs_mapplots.html?ofsregion="+in_ofs_region+"&subdomain="+in_subdomain+"&model_type="+sal_info[i].file+"\">"+sal_info[i].title+"</a></li>\n";
            $("#ofsmapdisplays_list").append(mapplots_link);
          } // end of for
        } // end of if diss_ok
      } // end of if sal_info

      // Displays the OFS map plots animation links below the ESRI map
      $("#second_ofsmapplots_list").append("<table width=\"600\">");
      $("#second_ofsmapplots_list").append("  <tr>");
      var maxrows = 0;
      // Set up the Data Type Icons
      var mapplots_count = 0;
      if (wl_info.length > 0) {
        $("#second_ofsmapplots_list").append("     <th valign=\"top\"><img src=\"/ofs/images/tideicon.png\" alt=\"Tide Icon\"><br>Water Level</th>");
        mapplots_count++;
        maxrows = (wl_info.length > maxrows) ? wl_info.length : maxrows;
      } 
      if (wind_info.length > 0) {
        $("#second_ofsmapplots_list").append("      <th valign=\"top\"><img src=\"/ofs/images/windicon.png\" alt=\"Winds Icon\"><br>Wind</th>");
        mapplots_count++;
        maxrows = (wind_info.length > maxrows) ? wind_info.length : maxrows;
      } 
      if (wt_info.length > 0) {
        $("#second_ofsmapplots_list").append("      <th valign=\"top\"><img src=\"/ofs/images/tempicon.png\" alt=\"Water Temperatuer Icon\"><br>Water Temperature</th>");
        mapplots_count++;
        maxrows = (wt_info.length > maxrows) ? wt_info.length : maxrows;
      } 
      if (sal_info.length > 0) {
        $("#second_ofsmapplots_list").append("     <th valign=\"top\"><img src=\"/ofs/images/salicon.png\" alt=\"Salinity Icon\"><br>Salinity</th>");
        mapplots_count++;
        maxrows = (sal_info.length > maxrows) ? sal_info.length : maxrows;
      } 
      if (cu_info.length > 0) {
        $("#second_ofsmapplots_list").append("      <th valign=\"top\"><img src=\"/ofs/images/curricon.png\" alt=\"Currents Icon\"><br>Currents</th>");
        mapplots_count++;
        maxrows = (cu_info.length > maxrows) ? cu_info.length : maxrows;
      } 

      $("#second_ofsmapplots_list").append("      </tr>     <tr>       <td colspan="+mapplots_count+" align=\"center\">(Please click on the categories below to access animated map plots)</td></tr>");
      var common_htmlcode = "                    <td align=\"center\" style=\"padding:2px;\"><a style=\"text-decoration:none;\" href=\"/ofs/ofs_mapplots.html?ofsregion="+in_ofs_region+"&subdomain="+in_subdomain+"&model_type=";

      for (var rownum = 1; rownum <= maxrows; rownum++) {
        $("#second_ofsmapplots_list").append("               <tr>");
        // first column is water level links
        if (wl_info.length > 0) {
          if (rownum < wl_info.length) {
            diss_ok = 1; // reset
            if (dissemination_status == 2 && waterlevel_diss_stopped == 1) { diss_ok = 0; }
            if (diss_ok) {
              mapplots_link = common_htmlcode + wl_info[rownum].file + "\">" + wl_info[rownum].title + "</a></td>";
            }
          } else {
            mapplots_link = "       <td align=\"center\">&nbsp;</td>";
          }
          $("#second_ofsmapplots_list").append(mapplots_link);
        }

        // second column is for wind links
        if (wind_info.length > 0) {
          if (rownum < wind_info.length) {
            diss_ok = 1; // reset
            if (dissemination_status == 2 && wind_diss_stopped == 1) { diss_ok = 0; }
            if (diss_ok) {
              mapplots_link = common_htmlcode + wind_info[rownum].file + "\">" + wind_info[rownum].title + "</a></td>";
            }
          } else {
            mapplots_link = "       <td align=\"center\">&nbsp;</td>";
          }
          $("#second_ofsmapplots_list").append(mapplots_link);
        }

        // third column is for water temperature links
        if (wt_info.length > 0) {
          if (rownum < wt_info.length) {
            diss_ok = 1; // reset
            if (dissemination_status == 2 && watertemp_diss_stopped == 1) { diss_ok = 0; }
            if (diss_ok) {
              mapplots_link = common_htmlcode + wt_info[rownum].file + "\">" + wt_info[rownum].title + "</a></td>";
            }
          } else {
            mapplots_link = "       <td align=\"center\">&nbsp;</td>";
          }
          $("#second_ofsmapplots_list").append(mapplots_link);
        }

        // fourth column is for salinity
        if (sal_info.length > 0) {
          if (rownum < sal_info.length) {
            diss_ok = 1; // reset
            if (dissemination_status == 2 && salinity_diss_stopped == 1) { diss_ok = 0; }
            if (diss_ok) {
              mapplots_link = common_htmlcode + sal_info[rownum].file + "\">" + sal_info[rownum].title + "</a></td>";
            }
          } else {
            mapplots_link = "       <td align=\"center\">&nbsp;</td>";
          }
          // Do not include the blank column of salinity if the OFS region is in the Great Lakes.
          if (! in_ofs_region.match(/(le|lmh|lo|ls)/g)) {
            $("#second_ofsmapplots_list").append(mapplots_link);
          }
        }

        // fifth column is for currents
        if (cu_info.length > 0) {
          if (rownum < cu_info.length) {
            diss_ok = 1; // reset
            if (dissemination_status == 2 && currents_diss_stopped == 1) { diss_ok = 0; }
            if (diss_ok) {
              mapplots_link = common_htmlcode + cu_info[rownum].file + "\">" + cu_info[rownum].title + "</a></td>";
            }
          } else {
            mapplots_link = "       <td align=\"center\">&nbsp;</td>";
          }
          $("#second_ofsmapplots_list").append(mapplots_link);
        }
        // Closing row
        $("#second_ofsmapplots_list").append("               </tr>");
      } // end of for
    } // end of if dissemination_status
    // Displays the message that this OFS region is off-line
    else {
      $("#ofsstation_list").html("");
      var ofs_name = in_ofs_region.toUpperCase() + "OFS";
      var message = "<p style=\"color:red\"><strong>The " + ofs_name + " dissemination has been stopped temporarily due to" +
          " technical issues. Please do not view any " + ofs_name + " time series plots and map plots!</strong></p>";
      $("#ofsstation_list").html(message);
      $("#ofsmapdisplays_list").html("");
      $("#ofsmapdisplays_list").html("<p style=\"color:red\"><strong>The " + ofs_name + " is offline!</strong></p>");
            $("#second_ofsmapplots_listt").html("");
      ofs_name = in_ofs_region.toUpperCase() + "OFS";
      message = "<p style=\"color:red\"><strong>The " + ofs_name + " dissemination has been stopped temporarily due to" +
          " technical issues. Please do not view any " + ofs_name + " time series plots and map plots!</strong></p>";
      $("#second_ofsmapplots_list").html(message);
    } // end of else
  }) // end of .getJSON
}); // end of $(document)
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
// End of Program ofslinks.js
