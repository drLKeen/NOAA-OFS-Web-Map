/******************************************************************************
* Javascript Name: ofs_mapplots.js
*
* Purpose: To check if the specified model display OFS dissemination is on
*          or stopped. If on, display the OFS map plots animations. Otherwise,
*          the OFS map plots animations are not displayed.
*
*         Also, for the CORMS-OFS Monitoring, it can bypass the CCP-OFS
*         dissemination check and display the OFS map plots animations.
*
*         This script gets the option file from the AWS CDN. Then set up the
*         CDN link of each graphics.
*
* This Javascript replaced the PERL CGI script, TAC /cgi-bin/ofs/ofs_mapplots.cgi
*
* Author: John Cassidy
*         NOAA/NOS/CO-OPS/ISD
*         March 4, 2024
*
* Modification History:
*  2026/03/13: TAC-4459: Changed the subdomain character limits from 3 to 4. The SECOFS
*                        has the 'prvi' subdomain name for Puerto Rico - Virgin Island. 
#                        Related to TAC-4406.
*  2025/02/27: TAC-4144: Deleted the codes for NEG/NWG (NGOFS2)
*
* Called by: /htdocs/ofs/ofs_mapplots.html
******************************************************************************/
// Global variables
let input_params_status = 1; // 0 = failed; 1 = passed;
let in_ofs_region, in_subdomain, in_model_type, model_type2, label_una;
let dissemination_status = 1, full_ofs_name = "", subdomain_name = "";
let sub_ofsweb = "";
let display_status = 1; // 0 = No; 1 = Yes

// main body
$(document).ready(function() {

  // Get the parameter value(s)
  if (OFS.getURLParam("ofsregion")) {
    if (!OFS.getURLParam("ofsregion").match("^[a-zA-Z]{2,3}$")) {
      OFS.showOFSInvalidParamsError("ofsregion");
      input_params_status = 0;
    } else {
      in_ofs_region = OFS.getURLParam("ofsregion");
    }
  }

  if (OFS.getURLParam("subdomain")) {
    if (!OFS.getURLParam("subdomain").match("^[a-zA-Z0\ ]{0,4}$")) {
      OFS.showOFSInvalidParamsError("subdomain");
      input_params_status = 0;
    } else {
      in_subdomain = OFS.getURLParam("subdomain");
    }
  }

  if (OFS.getURLParam("model_type")) {
    if (!OFS.getURLParam("model_type").match("^[A-Za-z_0-9]{1,}$")) {
      OFS.showOFSInvalidParamsError("model_type");
      input_params_status = 0;
    } else {
      in_model_type = OFS.getURLParam("model_type");
    }
  }

  // Set up the labels
  if (/wl/.test(in_model_type)) {
    model_type2 = "wl";
    label_una = "WATER LEVEL";
  } else if (/wtemp/.test(in_model_type)) {
    model_type2 = "wt";
    label_una = "WATER TEMPERATURE";
  } else if (/currents/.test(in_model_type)) {
    model_type2 = "cu";
    label_una = "CURRENTS";
  } else if (/wind/.test(in_model_type)) {
    model_type2 = "wind";
    label_una = "WIND";
  } else if (/sal/.test(in_model_type)) {
    model_type2 = "sal";
    label_una = "SALINITY";
  }

  // Get OFS Dissemination Status and full OFS name:
  // First - set up the MDAPI URL path
  if (location.hostname == "dev.tidesandcurrents.noaa.gov") {
    mdapi_url = "https://api.tidesandcurrents.noaa.gov/mdapi/dev/webapi/stations.json?type="+in_ofs_region+"ofs";
  } else if (location.hostname == "uat.tidesandcurrents.noaa.gov") {
    mdapi_url = "https://api.tidesandcurrents.noaa.gov/mdapi/uat/webapi/stations.json?type="+in_ofs_region+"ofs";
  } else {
    mdapi_url = "https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations.json?type="+in_ofs_region+"ofs";
  }

  // Second - Get OFS dissemination status
  $.ajax({
    async: false,
    url: mdapi_url,
    dataType: "json",
    success: function(jsondata) {
       let ofs_dissemination_data = jsondata.OFSDisseminationStatus;
       if (ofs_dissemination_data.diss_status == "off") { dissemination_status = 0; }
      } // end of ajax success function
  }); // end of ajax
  OFS.get_full_OFS_name(in_ofs_region,in_subdomain);

  // Get the option file name from XML file
  option_file = get_optionname(in_ofs_region, in_subdomain, in_model_type);

  if (in_ofs_region != "ng") {
    lower_ofsname = in_ofs_region + "ofs";
  } else {
    lower_ofsname = "ngofs2";
  }
  aws_ofsregion = in_ofs_region == "sj" ? "sjrofs" : lower_ofsname;
  cdnoptionfile = "https://cdn.tidesandcurrents.noaa.gov/ofs/" + aws_ofsregion + "/wwwgraphics/" + option_file;
  sublocation = "https://cdn.tidesandcurrents.noaa.gov/ofs/" + aws_ofsregion + "/wwwgraphics";
  ofs_mapplots_notice_file = "/ofs/" + lower_ofsname + "/" + lower_ofsname + "_mapplots_notice.html";
  ofs_alert_file = "/ofs/" + lower_ofsname + "/" + lower_ofsname + "_alert.html";

  // If this OFS region uses subdomain, get the subdomain information
  if (in_subdomain != "0") { Get_Subdomain_Info(lower_ofsname, in_subdomain); }

  //Set up a model type label for the main title in the web page
  model_type_label = label_una;
  model_type_label = formatString(model_type_label);
  if (/stations/.test(in_model_type)) { model_type_label = "Stations " + model_type_label; }
  model_type_label += (/forecast/.test(in_model_type)) ? " Forecast Guidance" : " Nowcast";

  main_ofs_label = (in_subdomain == "0") ? full_ofs_name + " OFS" : subdomain_name;
  html = `
    <h3 style="text-align:center">${main_ofs_label} ${model_type_label}</h3>`;
  $('#op').append(html);

  // Display the OFS-wide alert and animation notification messages
  // For the OFS-wide alert
  display_alert(ofs_alert_file);
  $('#op').append('    <div>');

  // Display notice messages only in the map plots animation web page
  display_notice_messages(ofs_mapplots_notice_file);

  html = `
  </div>
  <p class="text-center">All model nowcast and forecast information is based on a hydrodynamic
     model and should be considered as computer-generated nowcast and forecast guidance.</p>`;
  $('#op').append(html);

  $.ajax({
    async: false,
    url: cdnoptionfile,
    dataType: "text",
    success: function(option_data) {
      // Test if the option file is existed.  If not, exit.
      if (option_data.length < 0 && dissemination_status) {
        html = `
    <div class="alert alert-danger" role="alert" style="color:black">
      Error! Not able to get the OFS map plots animation option file.  Please notify the Modeling team at
      <a href="/contact.html">User Services</a> and describe the error in your e-mail body.
    </div>`;
        $('#op').append(html);
        Get_ModelDescription(in_ofs_region,in_model_type);
        Print_Breadcrumbs();
        display_status = 0;
      }
      // Determine if the ofs dissemination is running or stopped.
      if (dissemination_status && display_status == 1) {
        html = `
    <div class="row-fluid">
      <img src="/images/loading.gif" alt="${model_type_label} Plot" name="show" id="show" border="0">
      <form class="form-inline" name="slideform">
        <div class="well span10">
          <label for="Slider"><strong>Time/Date:</strong></label>
          <select name="slide" id="Slider" onChange="change();">`;

        // Get the png file names from the option file.
        lines = option_data.split("\n");
        for (let ii = 0; ii < lines.length; ii++) {
          optionline = lines[ii].replace(/model_graphics/,sublocation);
          html += optionline;
        } // end of for
        html += `
          </select>
          <label for="Previous"></label>
          <input type=button name="prevBtn" onClick="previous();" value="Prev" title="Previous" disabled>
          <label for="Start Animation"></label>
          <input type=button name="apBtn" onClick="ap(this.value);" value="Start Animation" title="Animation Play" disabled>
          <label for="Next"></label><input type=button name="nextBtn" onClick="next();" VALUE="Next" TITLE="Next" disabled>
        </div>
      </form>
    </div>`;
        $('#op').append(html);
      } else {
      // The OFS dissemination status is off, display the messages only and no animations displaying.
        html = `  <div class=\"alert alert-danger\" role=\"alert\" style=\"color:black\">${full_ofs_name} OFS
                      dissemination have been stopped temporarily either in all plots or partly",
                      due to technical issues.<br><br>THIS ${label_una} MAP PLOTS ANIMATION ARE NOT AVAILABLE!</div>`;
        $('#op').append(html);
      } // end of else

      Get_ModelDescription(in_ofs_region,in_model_type);

      // Set up the "breadcrumb" labels and links
      Print_Breadcrumbs();
      if (display_status) { init(); }
    } // end of ajax success function
  }); // end of ajax
}); // end of $(document)
// End of main body
/******************************************************************************
* Function Name: get_optionname
*
* Purpose: To get the
*
* Called by: Main body
********************************************************************************/
function get_optionname(in_ofs_region, in_subdomain, in_model_type) {
  xml_animationfile = '/ofs/ofs_animation.xml';
  ofsanim_reader = new XMLHttpRequest();
  ofsanim_reader.open("GET",xml_animationfile,false);
  ofsanim_reader.send();
  xmlDoc = ofsanim_reader.responseXML;

  let OFS_Animation_data = xmlDoc.documentElement.getElementsByTagName('OFS_Animation');
  for (let i = 0; i < OFS_Animation_data.length; i++) {

   // Get the OFS name then check if the OFS name is matched to the requested OFS name.
   // If not, skip this xml data and gets next one.  If so, get the animation file name and
   // link title.
    let xml_ofs_region = OFS_Animation_data[i].getElementsByTagName('ofs_region')[0].firstChild.nodeValue;
    if (xml_ofs_region != in_ofs_region) { continue; }

   // Get the subdomain name if it exists.  If not match to selected subdomain, skip this xml input and get
   // next one
    xml_subdomain = OFS_Animation_data[i].getElementsByTagName('subdomain')[0].firstChild.nodeValue;
    if (xml_subdomain != in_subdomain) { continue; }

  // Test if the model run type is matched
    xml_model_type = OFS_Animation_data[i].getElementsByTagName('model_type')[0].firstChild.nodeValue;
    if (xml_model_type != in_model_type) { continue; }

  // At last, get the option file name
    option_file = OFS_Animation_data[i].getElementsByTagName('option_file')[0].firstChild.nodeValue;
    return option_file;
  } // end of for
} // end of function get_optionname
//################################################################################
// Function Name: Get_Subdomain_Info
//
// Purpose: To get subdomain name, and subdomain web page.
//################################################################################
function Get_Subdomain_Info(lower_ofsname,in_subdomain) {
  sub_ofsweb = "/ofs/" + lower_ofsname + "/";
  ofssub = lower_ofsname + "_" + in_subdomain;
  xml_subdomainfile = '/ofs/ofs_subdomain.xml';
  ofssub_reader = new XMLHttpRequest();
  ofssub_reader.open("GET",xml_subdomainfile,false);
  ofssub_reader.send();
  xmlDoc = ofssub_reader.responseXML;

  let ofssub_data = xmlDoc.documentElement.getElementsByTagName('OFS_subdomain_info');
  for (let i = 0; i < ofssub_data.length; i++) {
    xml_ofssub = ofssub_data[i].getElementsByTagName('ofs_sub')[0].firstChild.nodeValue;
    if (xml_ofssub != ofssub) { continue; }
    sub_ofsweb += ofssub_data[i].getElementsByTagName('sub_ofsweb')[0].firstChild.nodeValue;
    subdomain_name = ofssub_data[i].getElementsByTagName('subname')[0].firstChild.nodeValue;
    break;
  } // end of for loooop
  sub_ofsweb += ".html";
} // end of function Get_Subdomain_Info
//**********************************************************************************
// Function Name: formatString
//
// Purpose: To change the string to first letter upper case and rest of the word to be
//          in the lower case.
//**********************************************************************************
function formatString(str) {
  return str
    .replace(/(\B)[^ ]*/g, match => (match.toLowerCase()))
    .replace(/^[^ ]/g, match => (match.toUpperCase()));
} // end of function formatString
//***********************************************************************************
// Function Name: display_alert
//
// Purpose: To display the specified OFS-wide alert message
//************************************************************************************
function display_alert(alert_file) {
  alerttxtreader = new XMLHttpRequest();
  let alerthtml = "";
  alerttxtreader.open("GET", alert_file, false);
  alerttxtreader.send();
  if (alerttxtreader.readyState == 4) {
    var lines = alerttxtreader.responseText.split("\n");
    for (i=0; i<lines.length; i++) {
      if (lines[i] == "") { break; }
      alerthtml += lines[i];
    }
  }
  $('#op').append(alerthtml);
} // end of function display_alert
//**********************************************************************************
// Function name: display_notice_message
//
// Purpose: To display any special messages on the OFS Map Plots for specified OFS
//          region.
//**********************************************************************************
function display_notice_messages(ofs_mapplots_notice_file) {
  noticetxtreader = new XMLHttpRequest();
  let noticehtml = "";
  noticetxtreader.open("GET", ofs_mapplots_notice_file, false);
  noticetxtreader.send();
  if (noticetxtreader.readyState == 4) {
    var lines = noticetxtreader.responseText.split("\n");
    for (i=0; i<lines.length; i++) {
      if (lines[i] == "") { break; }
      noticehtml += lines[i];
    }
  }
  $('#op').append(noticehtml);
} // end of function display_notice_messages
//**********************************************************************************
// Function Name: Get_ModelDescription
//
// Purpose: To display the model description
//**********************************************************************************
function Get_ModelDescription(in_ofs_region,in_model_type) {
  xml_animationfile = '/ofs/ofs_animation.xml';
  ofsdesc_reader = new XMLHttpRequest();
  ofsdesc_reader.open("GET",xml_animationfile,false);
  ofsdesc_reader.send();
  xmlDoc = ofsdesc_reader.responseXML;
  found_ofsregion = 0;
  xml_descr = "";

  let ofsdesc_data = xmlDoc.documentElement.getElementsByTagName('OFS_Model_Description');
  for (let i = 0; i < ofsdesc_data.length; i++) {
    xml_modeltype = ofsdesc_data[i].getElementsByTagName('model_type')[0].firstChild.nodeValue;
    if (xml_modeltype != in_model_type) { continue; }
    xml_ofsregions = ofsdesc_data[i].getElementsByTagName('ofs_regions')[0].firstChild.nodeValue;
    let test_ofs = xml_ofsregions.match(/_/g);
    if (test_ofs != null) {
      ofs_groups = xml_ofsregions.split("_");
      for (let jj = 0; jj < ofs_groups.length; jj++) {
        if (ofs_groups[jj] == in_ofs_region) {
          xml_descr = ofsdesc_data[i].getElementsByTagName('anim_desc')[0].firstChild.nodeValue;
          found_ofsregion = 1;
          break;
        }
      } 
    } else {
      if (xml_ofsregions == in_ofs_region) {
        xml_descr = ofsdesc_data[i].getElementsByTagName('anim_desc')[0].firstChild.nodeValue;
        found_ofsregion = 1;
        break;
      }
    } // end of else
    if (found_ofsregion) { break; }
  } // end of for loop
  uofsname = in_ofs_region.toUpperCase() + "OFS";
  if (xml_descr != "") {
    xml_descr = xml_descr.replace(/cofsnOFS/g, uofsname);
    xml_descr = xml_descr.replace(/ofsregion/, full_ofs_name);
    xml_descr = xml_descr.replace(/\(deg\)/, "&deg");
  }
  deschtml = `
    <p><strong>${model_type_label}</strong><br>
    ${xml_descr}
    </p>`;
  $('#op').append(deschtml);
} // end of function Get_ModelDescription
//**********************************************************************************
// Function Name: Print_Breadcrumbs
//
// Purpose: To display links and names across multiple pages
//**********************************************************************************
function Print_Breadcrumbs() {
  main_ofsweb = "/ofs/" + lower_ofsname + "/" + lower_ofsname + ".html";
  bread_html = `
<script type="text/javascript">
  var bc = new breadcrumb();
  bc.appendPath("<a href='/products.html'>Products</a>");
  bc.appendPath("<a href='/models.html'>Operational Forecast System (OFS)</a>");
  bc.appendPath("<a href='${main_ofsweb}'>${full_ofs_name} OFS</a>");`;
  if (in_subdomain != "0") {
    bread_html += `
  bc.appendPath("<a href='${sub_ofsweb}'>${subdomain_name}</a>");`;
  }
  bread_html += `
  bc.appendLocation("${model_type_label}");
</script>`;
  $('#op').append(bread_html);
} // End of function Print_Breadcrumbs
//**********************************************************************************
// Combined the slideshow_head.js into this ofs_mapplots.js

var rotate_delay = 1000; // delay in milliseconds (5000 = 5 secs)
var current = 0;
var currentCount = 1;
var waiting = 1;  // show waiting status for loading images, ONLY for Netscape 4.*
var waitMessage = "Please wait for the map plots to finish loading.";
var totalSlides;
var slides;

function init() {
// Initialize animation loading status
  status="Loading images...";
  totalSlides = document.slideform.slide.length;
  slides = new Array(totalSlides);

  for (var i = 0; i < totalSlides; i++) {
    slides[i] = new Image();
    slides[i].onload = updateStatus;
    slides[i].src = document.slideform.slide[i].value;
  }
} // end of function init
//**********************************************************************************
function updateStatus() {
  status="Loading images...image " + currentCount + " of " + totalSlides + " loaded.";
  document.images.show.src = slides[currentCount-1].src;
  document.slideform.slide.selectedIndex = currentCount-1;
  currentCount++;

  if (currentCount > totalSlides) {
    status = "Done";
    currentCount = 1;
    waiting = 0;
    document.slideform.prevBtn.disabled = false;
    document.slideform.nextBtn.disabled = false;
    document.slideform.apBtn.disabled = false;
    ap(document.slideform.apBtn.value);
  }
} // end of function updateStatus
//**********************************************************************************
function next() {
  if (waiting) alert(waitMessage);
  else {
    if (current+1 < totalSlides) {
      document.images.show.src = slides[current+1].src;
      document.slideform.slide.selectedIndex = ++current;
    } else first();
  }
} // end of function next
//**********************************************************************************
function previous() {
  if (waiting) alert(waitMessage);
  else {
    if (current-1 >= 0) {
     document.images.show.src = slides[current-1].src;
     document.slideform.slide.selectedIndex = --current;
    } else last();
  }
} // end of function previous
//**********************************************************************************
function first() {
  current = 0;
  document.images.show.src = slides[current].src;
  document.slideform.slide.selectedIndex = current;
} // End of function first
//**********************************************************************************
function last() {
  current = totalSlides-1;
  document.images.show.src = slides[current].src;
  document.slideform.slide.selectedIndex = current;
} // end of function last
//**********************************************************************************
function ap(text) {
  if (waiting) alert(waitMessage);
  else {
    document.slideform.apBtn.value = (text == "Stop Animation") ? "Start Animation" : "Stop Animation";
    rotate();
  }
} // end of function ap
//**********************************************************************************
function change() {
  if (waiting) alert(waitMessage);
  else {
    current = document.slideform.slide.selectedIndex;
    document.images.show.src = slides[current].src;
  }
} // end of function change
//**********************************************************************************
function rotate() {
  if (document.slideform.apBtn.value == "Stop Animation") {
    current = (current == totalSlides-1) ? 0 : current+1;
    document.images.show.src = slides[current].src;
    document.slideform.slide.selectedIndex = current;
    window.setTimeout("rotate()", rotate_delay);
  }
} // end of function rotate
//**********************************************************************************
// End of Program ofs_mapplots.js