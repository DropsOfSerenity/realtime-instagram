'use strict';

var socket = io.connect('https://instagram-realtime-test.herokuapp.com');

socket.on('show', function(data) {
  console.log(data);
});
