'use strict';

var config = require('./config.js');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var port = config.PORT;
var path = require('path');
var logger = require('morgan');
var server = require('http').createServer(app);
var io      = require('socket.io').listen(server);
server.listen(port);
var request = require('request');
var Instagram = require('instagram-node-lib');
var url = require('url');
var server_url = process.env.URL;

var routes = require('./routes/index');

/**
 * INSTAGRAM SETUP
 */
var insta_callback_url = server_url + '/callback';
Instagram.set('client_id', config.INSTA_CLIENT_ID);
Instagram.set('client_secret', config.INSTA_CLIENT_SECRET);
Instagram.set('callback_url', insta_callback_url);

io.sockets.on('connection', function (socket) {
  Instagram.tags.recent({
      name: 'weed',
      complete: function(data) {
        socket.emit('firstLoad', { firstLoad: data });
      }
  });
});

// unsubscribe all then subscribe to what i want
Instagram.subscriptions.list({
  complete: function(data) {
    data.forEach(function(sub) {
      Instagram.subscriptions.unsubscribe({ id: sub.id });
    });
  }
});

Instagram.subscriptions.subscribe({
  object: 'tag',
  object_id: 'weed',
  aspect: 'media',
  type: 'subscription',
  id: '#'
});

/**
 * SOCKET.IO SETUP
 */
io.set('transports', [
  'websocket', 'xhr-polling', 'flashsocket', 'htmlfile', 'jsonp-polling', 'polling'
]);

/**
 * EXPRESS
 */
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
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

app.post('/callback', function(req, res) {
  var data = req.body;
  console.log(data);

  data.forEach(function(tag) {
    var url = 'https://api.instagram.com/v1/tags/' + tag.object_id + '/media/recent?client_id=' + config.INSTA_CLIENT_ID;
    sendMessage(url);

  });
  res.end();
});

function sendMessage(url) {
  io.sockets.emit('show', {
    show: url
  });
}
