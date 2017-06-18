// true if user currently has an active question
var activeQuestion = true;
var hints = 0;
var maxHints = 2;

var map;
var clickMarker;
var cityMarker;
var line;

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
    zoom: 2,
    
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
  // setup map
  activeQuestion = true;
  map.setOptions({styles: blankMapStyles});
  if (clickMarker) {
    clickMarker.setMap(null);
  }
  if (cityMarker) {
    cityMarker.setMap(null);
  }
  if (line) {
    line.setMap(null);
  }
  map.setOptions({
    center: new google.maps.LatLng(0, 0),
    zoom: 2
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

function guess() {
  activeQuestion = false;
  
  cityMarker = placeMarker({lat: curQuestion.lat, lng: curQuestion.lng});
  
  // draw a dashed line between the two markers
  var lineSymbol = {
    path: 'M 0,-1 0,1',
    strokeOpacity: 1,
    scale: 4
  };
  
  console.log({lat: curQuestion.lat, lng: curQuestion.lng});
  line = new google.maps.Polyline({
    path: [
      clickMarker.getPosition(),
      cityMarker.getPosition(),
    ],
    strokeOpacity: 0,
    icons: [{
      icon: lineSymbol,
      offset: '0',
      repeat: '20px'
    }],
    map: map
  });
  console.log("b");
  
  map.setOptions({styles: []});
  $("#primary-button").text("New Question");
  $("#primary-button").removeClass("inactive");
  centerMap();
  
  $("#secondary-button").css("display", "");
  
  var distanceKm = Math.round(google.maps.geometry.spherical.computeDistanceBetween(
    clickMarker.getPosition(), cityMarker.getPosition()) / 1000);
  
  document.getElementById("normal-label-1").innerHTML = "You were&nbsp;";
  document.getElementById("bold-label-1").innerHTML = distanceKm + "km";
  document.getElementById("normal-label-2").innerHTML = "&nbsp;away from&nbsp;"
  document.getElementById("bold-label-2").innerHTML = curQuestion.city + ", " + curQuestion.province + ", " + curQuestion.country;
  
  
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
  var bounds = new google.maps.LatLngBounds();
  bounds.extend(clickMarker.position);
  bounds.extend(cityMarker.position);
  map.fitBounds(bounds);
}

