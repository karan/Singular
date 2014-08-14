// Takes a tweets object and calls the callback with modified tweet object if
// it's a valid SC/YT tweets, null otherwise.

var request = require('request');

module.exports.songify = function(tweet, callback) {
  if (tweet === undefined || tweet.entities.urls.length === 0) {
    return callback(null);  // no urls
  }

  if (tweet.coordinates === null && tweet.place === null) {
    return callback(null);
  }

  var url = tweet.entities.urls[0].expanded_url.toLowerCase();

  console.log(url);

  if ((url.indexOf("soundcloud.com") === -1) &&
      (url.indexOf("snd.sc") === -1) && 
      (url.indexOf("youtube.com") === -1) &&
      (url.indexOf("youtu.be") === -1)) {
        return callback(null);
  }

  var obj = {};
  obj.tweet_id = tweet.id_str;
  obj.tweeted_by = tweet.user.screen_name;
  obj.tweeted_by_photo = tweet.user.profile_image_url || '';
  obj.song_url = tweet.entities.urls[0].expanded_url.toLowerCase();

  if (tweet.coordinates) {
    obj.coordinates = tweet.coordinates.coordinates;
  } else if (tweet.place) {
    obj.coordinates = centerPoint(tweet.place.bounding_box.coordinates[0]);
  } else {
    return callback(null);
  }

  if ((obj.song_url.indexOf("soundcloud.com") === -1) &&
      (obj.song_url.indexOf("snd.sc") === -1)) {
    obj.song_source = 'yt';
  } else {
    obj.song_source = 'sc';
  }

  if (obj.song_source === 'sc') {
    var url = 'https://api.soundcloud.com/resolve.json?consumer_key=c2c242fd7d60a1165e6a0924f8e70138&url='+obj.song_url;
    request({url: url, timeout: 500, followRedirect: true},
      function(error, response, track) {
        if (!error && response.statusCode == 200) {
          track = JSON.parse(track);     
          obj.artwork_url = track.artwork_url;
          obj.song_id = track.id;
          obj.song_title = track.title;
          return callback(obj);
        }
    });
  } else {
    var ytMatches = obj.song_url.match(/(youtu\.be\/|v=)([^&]+)/);
    if (ytMatches) {
      ytID = ytMatches[2];
      var url = 'http://gdata.youtube.com/feeds/api/videos?q='+ytID+'&max-results=1&v=2&alt=jsonc';
      request({url: url, timeout: 500, followRedirect: true},
        function(error, response, track) {
          if (!error && response.statusCode == 200) {
            try {
              track = JSON.parse(track);              
            } catch(err) {
              console.log(err);
              return callback(null);
            }
            if (track && track.data && track.data.items && 
              track.data.items[0].category === 'Music') {
              
              track = track.data.items[0];

              obj.artwork_url = track.thumbnail.hqDefault;
              obj.song_id = track.id;
              obj.song_title = track.title;
              return callback(obj);
            }
          }
      });
    }
  }
}

var centerPoint = function(coords) {
  var centerPointX, centerPointY, coord, i, _len;
  centerPointX = centerPointY = 0;
  for (i = 0, _len = coords.length; i < _len; i++) {
    coord = coords[i];
    centerPointX += coord[0];
    centerPointY += coord[1];
  }
  return [centerPointX / coords.length, centerPointY / coords.length];
};
