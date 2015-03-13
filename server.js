'use strict';

/**
 * REQUIRES
 */
var bodyParser = require('body-parser'),
  config = require('./config.js'),
  express = require('express'),
  path = require('path'),
  logger = require('morgan'),
  routes = require('./routes/index'),
  Instagram = require('instagram-node-lib');

/**
 * VARS
 */
var server_url = process.env.URL;
var insta_callback_url = server_url + '/callback';

/**
 * SERVER SETUP
 */
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
server.listen(config.PORT);

/**
 * INSTAGRAM SETUP
 */
Instagram.set('client_id', config.INSTA_CLIENT_ID);
Instagram.set('client_secret', config.INSTA_CLIENT_SECRET);
Instagram.set('callback_url', insta_callback_url);

// unsubscribe all then subscribe to what i want
Instagram.subscriptions.list({
  complete: function(data) {
    data.forEach(function(sub) {
      Instagram.subscriptions.unsubscribe({
        id: sub.id
      });
    });

    // after we've unsubbed, subscribe to applicable
    Instagram.subscriptions.subscribe({
      object: 'tag',
      object_id: 'love',
      aspect: 'media',
      type: 'subscription',
      id: '#'
    });
  }
});

/**
 * SOCKET.IO SETUP
 */
io.set('transports', [
  'websocket', 'xhr-polling', 'flashsocket', 'htmlfile', 'jsonp-polling', 'polling'
]);

/**
 * EXPRESS SETUP
 */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(express.static(path.join(__dirname, 'public')));

/**
 * ROUTES
 */

app.use('/', routes);

app.get('/callback', function(req, res) {
  Instagram.subscriptions.handshake(req, res);
});

var instagramTimeout;
var acceptingMore = true;
app.post('/callback', function(req, res) {
  // TODO: this needs to act on a per tag basis.
  if (!acceptingMore) return res.end();

  console.log(req.body);

  var data = req.body;
  instagramTimeout = setTimeout(function() {
    acceptingMore = true;
  }, 1000);
  acceptingMore = false;
  data.forEach(function(tag) {
    var url = 'https://api.instagram.com/v1/tags/' + tag.object_id + '/media/recent?client_id=' + config.INSTA_CLIENT_ID;
    sendMessage(url, 'love');
  });
  res.end();
});

function sendMessage(url, tag) {
  io.sockets.emit(tag, {
    show: url
  });
}

/**
 * SOCKET TRIGGER
 */
io.sockets.on('connection', function(socket) {
  Instagram.tags.recent({
    name: 'love',
    complete: function(data) {
      socket.emit('firstLoad', {
        firstLoad: data
      });
    }
  });
});
