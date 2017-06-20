// true if user currently has an active question
var activeQuestion = true;
var hints = 0;
var maxHints = 2;

var defaultZoom = 2;

var map;
var clickMarker;
var cityMarker;
var circle;

var curQuestion = {};

var blankMapStyles = [
  { 
    featureType: "administrative", 
    stylers: [ 
      { visibility: "off" } 
    ] 
  },
  { 
    featureType: "poi", 
    stylers: [ 
      { visibility: "off" } 
    ] 
  },
  { 
    featureType: "road", 
    stylers: [ 
      { visibility: "off" } 
    ] 
  },
  { 
    featureType: "transit", 
    stylers: [ 
      { visibility: "off" } 
    ] 
  },
   { 
    elementType: "labels", 
    stylers: [ 
      { visibility: "off" } 
    ] 
  },
]

window.onload = function() {
  console.log("hello!");
  
  let mapProp = {
    center: new google.maps.LatLng(0, 0),
    zoom: defaultZoom,
    
    streetViewControl: false,
    mapTypeId: google.maps.MapTypeId.TERRAIN,
    mapTypeControl: false,

    styles : blankMapStyles,
    draggableCursor:'crosshair'
  }
    
  map = new google.maps.Map(document.getElementById("googleMap"), mapProp); 
  
  map.addListener('click', function(event) {
    if (clickMarker) {
      clickMarker.setMap(null);
    }
    
    if (activeQuestion) {
      $("#secondary-button").css("display", "initial");
      clickMarker = placeMarker(event.latLng);
    }
  });
  
  loadQuestion();
}

function loadQuestion() {
  closePopover();
  
  // setup map
  activeQuestion = true;
  map.setOptions({styles: blankMapStyles});
  if (clickMarker) {
    clickMarker.setMap(null);
  }
  if (cityMarker) {
    cityMarker.setMap(null);
  }
  if (circle) {
    circle.setMap(null);
  }
  map.setOptions({
    center: new google.maps.LatLng(0, 0),
    zoom: defaultZoom
  });
  
  
  // setup header
  hints = 0;
  $("#primary-button").text("Hint");
  curQuestion = cities.cities[parseInt(Math.random() * cities.cities.length)];
  console.log(curQuestion);
  document.getElementById("normal-label-1").innerHTML = "Find&nbsp;";
  document.getElementById("bold-label-1").innerHTML = curQuestion.city;
  document.getElementById("normal-label-2").innerHTML = ""
  document.getElementById("bold-label-2").innerHTML = "";
  document.getElementById("normal-label-3").innerHTML = ""
  document.getElementById("bold-label-3").innerHTML = "";
}

function hintClick() {
  if (activeQuestion) { 
    if (hints == 0) {
      document.getElementById("bold-label-1").innerHTML += ", " + curQuestion.province;
    } else if (hints == 1) {
      document.getElementById("bold-label-1").innerHTML += ", " + curQuestion.country;
    }
    
    hints++;
    if (hints >= maxHints) {
      $("#primary-button").addClass("inactive");
    }
  } else {
    loadQuestion();
  }
}

function closePopover() {
  $("#popover").css("display", "");
}

function popoverClick(event) {
  closePopover();
}

function popoverBodyClick(event) {
  event.stopPropagation();
}

function guess() {
  activeQuestion = false;
  
  cityMarker = placeMarker({lat: curQuestion.lat, lng: curQuestion.lng});
  
  var distanceM = Math.round(google.maps.geometry.spherical.computeDistanceBetween(
    clickMarker.getPosition(), cityMarker.getPosition()));
  
  circle = new google.maps.Circle({
    map: map,
    radius: distanceM,
    strokeColor: '#000000',
    strokeOpacity: 0,
    // strokeWeight: 2,
    fillColor: '#FF0000',
    fillOpacity: 0.25,
  });
  circle.bindTo('center', cityMarker, 'position');
  
  map.setOptions({styles: []});
  $("#primary-button").text("New Question");
  $("#primary-button").removeClass("inactive");
  centerMap();
  
  $("#secondary-button").css("display", "");
  
  var distanceKm = Math.round(distanceM / 1000)
  
  document.getElementById("normal-label-1").innerHTML = "You were&nbsp;";
  document.getElementById("bold-label-1").innerHTML = distanceKm + "km";
  document.getElementById("normal-label-2").innerHTML = "&nbsp;away from&nbsp;"
  document.getElementById("bold-label-2").innerHTML = curQuestion.city + ", " + curQuestion.province + ", " + curQuestion.country;
  document.getElementById("normal-label-3").innerHTML = "&nbsp;-&nbsp;Score:&nbsp;"
  document.getElementById("bold-label-3").innerHTML = score(distanceKm, curQuestion.pop, hints);
  
  document.getElementById("popover-score-bold").innerHTML = score(distanceKm, curQuestion.pop, hints);
  document.getElementById("popover-distance-bold").innerHTML = distanceKm + "km";
  document.getElementById("popover-pop-bold").innerHTML = curQuestion.pop;
  document.getElementById("popover-hints-bold").innerHTML = hints
  
  $("#popover").css("display", "flex");
  console.log(cityMarker.position.lat())
  console.log(clickMarker.position.lat())
  if (cityMarker.position.lat() > clickMarker.position.lat()) {
    // cityMarker is farther north
    $("#popover-body").css("margin-top", "50px");
    $("#popover-body").css("margin-bottom", "");
  } else {
    $("#popover-body").css("margin-top", "");
    $("#popover-body").css("margin-bottom", "50px");
  }
}

function placeMarker(location, color) {
  var options = {
    position: location, 
    map: map
  }
  
  if (color) {
    if (color == "red") {
      // do nothing; defualt is already red
    } else if (color == "green") {
      options.icon = "./greenMarker.png"
    } else {
      // TODO as needed
    }
  }

  var marker = new google.maps.Marker(options);
  return marker;
}

// center map between click and city markers
function centerMap() {
  // var bounds = new google.maps.LatLngBounds();
  // bounds.extend(clickMarker.position);
  // bounds.extend(cityMarker.position);
  // map.fitBounds(bounds);
  map.panTo(cityMarker.position);
  map.fitBounds(circle.getBounds()); 
  // smoothZoom(map.getZoom(), getZoomByBounds(circle.getBounds()), map.getZoom());
}

// the smooth zoom function
// based on https://stackoverflow.com/questions/4752340/how-to-zoom-in-smoothly-on-a-marker-in-google-maps
function smoothZoom (start, final, cur) {
  console.log("smoothZoom");
  console.log(start)
  console.log(final);
  console.log(cur);
  if (cur == final) {
      return;
  }
  else {
    var change = 1;
    if (start > final) {
      change = -1;
    }
    z = google.maps.event.addListener(map, 'zoom_changed', function(event) { // or idle
      google.maps.event.removeListener(z);
      smoothZoom(start, final, cur + change);
    });
    setTimeout(function(){map.setZoom(cur)}); // 80ms is what I found to work well on my system -- it might not work well on all systems
  }
} 

/**
* Returns the zoom level at which the given rectangular region fits in the map view. 
* The zoom level is computed for the currently selected map type. 
* @param {google.maps.LatLngBounds} bounds 
* @return {Number} zoom level
*
* based off https://stackoverflow.com/questions/9837017/equivalent-of-getboundszoomlevel-in-gmaps-api-3
**/
function getZoomByBounds(bounds){
  console.log(bounds);
  var MAX_ZOOM = map.mapTypes.get( map.getMapTypeId() ).maxZoom || 21 ;
  var MIN_ZOOM = map.mapTypes.get( map.getMapTypeId() ).minZoom || 0 ;

  var ne= map.getProjection().fromLatLngToPoint( bounds.getNorthEast() );
  var sw= map.getProjection().fromLatLngToPoint( bounds.getSouthWest() ); 

  var worldCoordWidth = Math.abs(ne.x-sw.x);
  var worldCoordHeight = Math.abs(ne.y-sw.y);

  //Fit padding in pixels 
  var FIT_PAD = 40;

  for( var zoom = MAX_ZOOM; zoom >= MIN_ZOOM; --zoom ){ 
      if( worldCoordWidth*(1<<zoom)+2*FIT_PAD < $(map.getDiv()).width() && 
          worldCoordHeight*(1<<zoom)+2*FIT_PAD < $(map.getDiv()).height() )
          return zoom;
  }
  return 0;
} 

// score should be inverse to distance, inverse to population, and inverse to hints
function score(distanceKm, population, hints) {
  var distanceFactor = 500; // would be a mediocre/bad distance
  var distancePow = 1.5; // should be most significant
  var populationFactor = 683111 // median population
  var populationPow = 0.5; // should be less significant
  
  var hintLoss = 0.2;
  
  var overallMultiplier = 100;
  
  var decimals = 2;
  var decimalsFactor = Math.pow(10, decimals);
  
  // general idea: weight the distance/population score, then multiply some powered function that affects their signficance
  // distance should be more significatn that population
  return decimalsFactor * Math.round(overallMultiplier * 
    Math.pow((distanceFactor / distanceKm), distancePow) * 
    Math.pow((populationFactor / population), populationPow) * 
    Math.pow(1 - hintLoss, hints) / decimalsFactor)
}

