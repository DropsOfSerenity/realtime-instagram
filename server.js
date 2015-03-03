'use strict';

var config = require('./config.js');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var port = config.PORT;
var io = require('socket.io').listen(app.listen(port));
var request = require('request');
var Instagram = require('instagram-node-lib');
var url = require('url');

var server_url = process.env.URL;

/**
 * INSTAGRAM SETUP
 */
var insta_callback_url = server_url + '/callback';
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
  var body, headers, parsedRequest;

  parsedRequest = url.parse(request.url, true);

  console.log(parsedRequest);
  if (parsedRequest['query']['hub.mode'] === 'subscribe' && (parsedRequest['query']['hub.challenge'] != null) && parsedRequest['query']['hub.challenge'].length > 0) {
    body = parsedRequest['query']['hub.challenge'];
    headers = {
      'Content-Length': body.length,
      'Content-Type': 'text/plain'
    };
    response.writeHead(200, headers);
    response.write(body);
    if ((parsedRequest['query']['hub.verify_token'] != null) && (typeof complete !== "undefined" && complete !== null)) {
      complete(parsedRequest['query']['hub.verify_token']);
    }
  } else {
    response.writeHead(400);
  }
  console.log(response);
  response.end();
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
