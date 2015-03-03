'use strict';

var config = require('./config.js');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var port = config.PORT;
var socketio = require('socket.io').listen(app.listen(port));
var request = require('request');
var Instagram = require('instagram-node-lib');

/**
 * INSTAGRAM SETUP
 */
 var insta_callback_url = 'http://localhost:' + port + '/callback';
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
 * EXPRESS
 */
app.use(bodyParser.json());

 /**
  * ROUTES
  */
 app.get('/subscribe', function(request, response){
   Instagram.subscriptions.handshake(request, response);
 });
