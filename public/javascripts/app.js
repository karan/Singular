var map;

$(document).ready(function() {

  $('.md-modal').addClass('md-show');
  $('.sbg-help').on('click', function(e) {
    $('.md-modal').addClass('md-show');
  });
  $('.md-close').on('click', function(e) {
    $('.md-modal').removeClass('md-show');
  });

  var mapOptions;
  mapOptions = void 0;
  mapOptions = {
    zoom: 2,
    center: new google.maps.LatLng(5, -30),
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    zoomControl: true,
    disableDefaultUI: true
  };

  map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

  var host = location.origin.replace(/^http/, 'ws');
  console.log(host);
  var socket = io.connect(host);
  socket.on('newTweet', function (data) {
    console.log(data);
    var marker = addToMap(data);
    addToSidebar(data, marker);
  });

});


function addToMap(data) {
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

  marker.setIcon(new google.maps.MarkerImage(
    "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|FF0000",
    null, null, null, new google.maps.Size(15, 24)
  ));
  
  // create the tooltip
  createInfoWindow(marker, data);
  return marker;
}

function addToSidebar(data, marker) {
  console.log("adding to sidebar");
  var userImg = '<img src="' + data.tweeted_by_photo + '" class="profilePic">';
  var username = '<a href="https://twitter.com/' + data.tweeted_by + '/status/' + data.tweet_id + '" class="username" target="_blank">' + data.tweeted_by + '</a>';
  var playerCode;
  if (data.song_source === 'sc') {
    playerCode = '<iframe id="sc-player" width="100%" height="100%" scrolling="no" frameborder="no", src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/' + data.song_id + '&amp;auto_play=false&amp;hide_related=true&amp;show_comments=false&amp;show_user=false&amp;show_reposts=false&amp;visual=true"></iframe>';
  } else {
    playerCode = '<iframe id="ytplayer" type="text/html" width="100%" src="http://www.youtube.com/embed/' + data.song_id + '?autoplay=0" frameborder="0"/>';
  }
  var html = '<div class="row" id="' + data.tweet_id + '"><div class="user">' + userImg + username + '</div>' + playerCode + '</div><hr>';
  $('#allsongs').prepend(html);

  $('#' + data.tweet_id).bind("mouseenter", function (event) {
    google.maps.event.trigger(marker, 'click');
  });
}

var lastOpenInfoWin = null;

function createInfoWindow(marker, data) {
  //create an infowindow for this marker
  var content = '<p><a href="https://twitter.com/' + data.tweeted_by + '/status/' + data.tweet_id + '" class="infowindowUsername" target="_blank">@' + data.tweeted_by + '</a><br>' + data.song_title + '</p>';
  var infowindow = new google.maps.InfoWindow({
    content: content,
    maxWidth: 150
  });
  //open infowindo on click event on marker.
  google.maps.event.addListener(marker, 'click', function() {
    if(lastOpenInfoWin) {
      lastOpenInfoWin.close();
    }
    lastOpenInfoWin = infowindow;
    return infowindow.open(marker.get('map'), marker);
  });
}
