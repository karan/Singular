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
  addToSidebar(data);
});


var addToMap = function(data) {
  var coords = data.coordinates;  // lng, lat
  var lat = coords[1];
  var lng = coords[0];

  var zoom = map.getZoom();
  var marker = new google.maps.Marker({
    position: new google.maps.LatLng(lat, lng),
    title: data.song_title,
    raiseOnDrag: false,
    draggable: false,
    animation: google.maps.Animation.DROP,
    map: map
  });
  
  // create the tooltip
  createInfoWindow(marker, data.song_title);
}

var addToSidebar = function(data) {
  if (data.song_source === 'sc') {
    $('#allsongs').prepend('<iframe id="sc-player" width="100%" height="100%" scrolling="no" frameborder="no", src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/'+song_id+'&amp;auto_play=false&amp;hide_related=true&amp;show_comments=false&amp;show_user=false&amp;show_reposts=false&amp;visual=true"></iframe>')
  } else {
    var playerCode = '<iframe id="ytplayer" type="text/html" width="100%" src="http://www.youtube.com/embed/'+data.song_id+'?autoplay=0" frameborder="0"/>';
    $('#allsongs').prepend(playerCode);
  }
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
