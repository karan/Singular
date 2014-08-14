require('newrelic');

/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
// var process = require('process');
var config = require('./config.json');

var twit = require('twit');
var socketio = require('socket.io');

var app = express();


// all environments
app.set('port', process.env.PORT || 8888);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// socket hang up exception
process.on('uncaughtException', function (exception) {
  console.log(exception);
});


app.get('/', routes.index);


var io = require('socket.io').listen(app.listen(app.get('port')));

var T = new twit({
  consumer_key: config.twitter.key,
  consumer_secret: config.twitter.secret,
  access_token: config.twitter.oauth_token,
  access_token_secret: config.twitter.oauth_token_secret
});

io.sockets.on('connection', function (socket) {

  console.log("client connected");

  var stream = T.stream('statuses/filter', {
    track: ['snd.sc', 'soundcloud', 'listen', 'hear', 'song', 'youtu.be',
            'y2u.be', 'goo.gl', 'youtube', 'music', 'artist', 'playlist',
            'album', 'stream'],
    locations: ['-180', '-90', '180', '90']
  });
  // var tweet = JSON.parse('{"created_at":"Tue Aug 12 04:53:54 +0000 2014","id":499056158896689152,"id_str":"499056158896689152","text":"Have you heard \u2018F.O.O.L - Keep On Rocking\u2019 by Monstercat on #SoundCloud? https:\/\/t.co\/1frAieuIW0","source":"\u003ca href=https:\/\/dev.twitter.com\/docs\/tfw rel=nofollow\u003eTwitter for Websites\u003c\/a\u003e","truncated":false,"in_reply_to_status_id":null,"in_reply_to_status_id_str":null,"in_reply_to_user_id":null,"in_reply_to_user_id_str":null,"in_reply_to_screen_name":null,"user":{"id":97194047,"id_str":"97194047","name":"Karan Goel","screen_name":"karangoel","location":"Bay Area","description":"Developer \u2022 CS @UW \u2022 Intern @Google \u2022 Team @DubHacks \u2022 Busy making fine things","url":"http:\/\/t.co\/1DtsqOfyFO","entities":{"url":{"urls":[{"url":"http:\/\/t.co\/1DtsqOfyFO","expanded_url":"http:\/\/www.goel.im","display_url":"goel.im","indices":[0,22]}]},"description":{"urls":[]}},"protected":false,"followers_count":4331,"friends_count":61,"listed_count":53,"created_at":"Wed Dec 16 12:01:35 +0000 2009","favourites_count":208,"utc_offset":-25200,"time_zone":"Pacific Time (US & Canada)","geo_enabled":true,"verified":false,"statuses_count":6341,"lang":"en","contributors_enabled":false,"is_translator":false,"is_translation_enabled":false,"profile_background_color":"1A1B1F","profile_background_image_url":"http:\/\/abs.twimg.com\/images\/themes\/theme9\/bg.gif","profile_background_image_url_https":"https:\/\/abs.twimg.com\/images\/themes\/theme9\/bg.gif","profile_background_tile":false,"profile_image_url":"http:\/\/pbs.twimg.com\/profile_images\/487085788903927808\/mil7eIrU_normal.jpeg","profile_image_url_https":"https:\/\/pbs.twimg.com\/profile_images\/487085788903927808\/mil7eIrU_normal.jpeg","profile_banner_url":"https:\/\/pbs.twimg.com\/profile_banners\/97194047\/1399226670","profile_link_color":"3366A4","profile_sidebar_border_color":"181A1E","profile_sidebar_fill_color":"252429","profile_text_color":"666666","profile_use_background_image":true,"default_profile":false,"default_profile_image":false,"following":false,"follow_request_sent":false,"notifications":false},"geo":null,"coordinates":null,"place":null,"contributors":null,"retweet_count":0,"favorite_count":0,"entities":{"hashtags":[{"text":"SoundCloud","indices":[60,71]}],"symbols":[],"urls":[{"url":"https:\/\/t.co\/1frAieuIW0","expanded_url":"https:\/\/soundcloud.com\/monstercat\/fool-keep-on-rocking?utm_source=soundcloud&utm_campaign=share&utm_medium=twitter","display_url":"soundcloud.com\/monstercat\/foo\u2026","indices":[73,96]}],"user_mentions":[]},"favorited":false,"retweeted":false,"possibly_sensitive":false,"lang":"en"}');
  stream.on('tweet', function(tweet) {
    require('./helpers/songify').songify(tweet, function(obj) {
      if (obj) {
        console.log(obj);
        socket.emit('newTweet', obj);
      }
    });
  });

});



console.log("Server starter on port " + app.get('port'));
