// Takes a tweets object and calls the callback with modified tweet object if
// it's a valid SC tweets, null otherwise.

module.exports.sc = function(tweet, callback) {
  if (tweet === undefined || tweet.entities.urls.length === 0) {
    return callback(null);  // no urls
  }

  if (tweet.coordinates === null && tweet.place === null) {
    return callback(null);
  }

  var url = tweet.entities.urls[0].expanded_url.toLowerCase();
  if ((url.indexOf("soundcloud.com") === -1) &&
      (url.indexOf("snd.sc") === -1)) {
        return callback(null);
  }

  var obj = {};
  obj.tweet_id = tweet.id_str;
  obj.tweeted_by = tweet.user.screen_name;
  obj.tweeted_by_photo = tweet.user.profile_image_url || '';

  if (tweet.coordinates) {
    obj.coordinates = tweet.coordinates.coordinates;
  } else if (tweet.place) {
    centerPoint(tweet.place.bounding_box.coordinates[0], function (center) {
      obj.coordinates = center;
    });
  } else {
    return callback(null);
  }

  obj.place = tweet.place;
  obj.geo = tweet.geo;
  obj.song_url = tweet.entities.urls[0].expanded_url.toLowerCase();

  var url = 'https://api.soundcloud.com/resolve.json?consumer_key=c2c242fd7d60a1165e6a0924f8e70138&url='+obj.song_url;
  require('request')({url: url, timeout: 500, followRedirect: true},
    function(error, response, track) {
      if (!error && response.statusCode == 200) {
        track = JSON.parse(track);     
        obj.artwork_url = track.artwork_url;
        obj.sc_id = track.id;
        obj.song_title = track.title;
        return callback(obj);
      }
  });
}

var centerPoint = function(coords, callback) {
  var centerPointX, centerPointY, coord, i, _len;
  centerPointX = centerPointY = 0;
  for (i = 0, _len = coords.length; i < _len; i++) {
    coord = coords[i];
    centerPointX += coord[0];
    centerPointY += coord[1];
  }
  return callback([centerPointX / coords.length, centerPointY / coords.length]);
};
