require('newrelic');

/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var path = require('path');
var config = require('./config.json');

var twit = require('twit');

var app = express();

var server = require('http').createServer(app),
    io = require('socket.io').listen(server);


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

  stream.on('tweet', function(tweet) {
    require('./helpers/songify').songify(tweet, function(obj) {
      if (obj) {
        console.log(obj);
        socket.emit('newTweet', obj);
      }
    });
  });

});


server.listen(app.get('port'));
console.log("Server starter on port " + app.get('port'));
