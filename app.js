
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
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

  var stream = T.stream('statuses/filter', { track: ['youtube', 'soundcloud'] });

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
