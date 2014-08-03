$(document).ready(function() {

  var mapOptions;
  mapOptions = void 0;
  mapOptions = {
    zoom: 2,
    center: new google.maps.LatLng(5, -30),
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    zoomControl: true,
    disableDefaultUI: true
  };

  return map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

});

var socket = io.connect('http://localhost:8888');

socket.on('newTweet', function (data) {
  console.log(data);
  addToMap(data);
});


var addToMap = function(data) {
  console.log("mapping out the tweet");
  var coords = data.coordinates;  // lng, lat
  var lat = coords[1];
  var lng = coords[0];

  var zoom = map.getZoom();
  var tweet = new google.maps.Marker({
    position: new google.maps.LatLng(lat, lng),
    optimized: false,
    draggable:false,
    zIndex:10,
    map: map
  });
  var marker = new google.maps.Marker({
    position: new google.maps.LatLng(lat, lng),
    title: data.song_title,
    raiseOnDrag: false,
    draggable:false,
    animation: google.maps.Animation.DROP
  });
  
  // create the tooltip
  createInfoWindow(marker, data.song_title);
  setTimeout(function(){
    tweet.setMap(null);
    marker.setMap(map);
  }, 2500);
}

var lastOpenInfoWin = null;
function createInfoWindow(marker, text) {
  //create an infowindow for this marker
  var infowindow = new google.maps.InfoWindow({
    content: text,
    maxWidth:150
  });
  //open infowindo on click event on marker.
  google.maps.event.addListener(marker, 'click', function() {
    if(lastOpenInfoWin) lastOpenInfoWin.close();
    lastOpenInfoWin = infowindow;
    infowindow.open(marker.get('map'), marker);
  });
}
