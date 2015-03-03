'use strict';

var config = require('./config.js');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var port = config.PORT;
var io = require('socket.io').listen(app.listen(port));
var request = require('request');
var Instagram = require('instagram-node-lib');

var url = process.env.URL;

/**
 * INSTAGRAM SETUP
 */
var insta_callback_url = url + ':' + port + '/callback';
Instagram.set('client_id', config.INSTA_CLIENT_ID);
Instagram.set('client_secret', config.INSTA_CLIENT_SECRET);
Instagram.set('callback_url', insta_callback_url);

Instagram.subscriptions.subscribe({
  object: 'tag',
  object_id: 'aboveandbeyond',
  aspect: 'media',
  type: 'subscription',
  id: '#'
});

/**
 * SOCKET.IO SETUP
 */
io.set('transports', [
 'websocket', 'xhr-polling', 'flashsocket', 'htmlfile', 'jsonp-polling'
]);

/**
 * EXPRESS
 */
app.use(bodyParser.json());

/**
 * ROUTES
 */
app.get('/subscribe', function(request, response) {
  Instagram.subscriptions.handshake(request, response);
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
