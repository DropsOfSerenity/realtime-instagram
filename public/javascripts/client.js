'use strict';

var socket = io.connect('https://instagram-realtime-test.herokuapp.com');
var MAX_IMG_AMOUNT = 5;

socket.on('show', function(data) {
  var url = data.show;
  $.ajax({
      url: url,
      type: 'POST',
      crossDomain: true,
      dataType: 'jsonp'
  }).done(function (resp) {
    appendNewImage(resp);
  });
});

socket.on('firstLoad', function(data) {

});

function appendNewImage(data) {
  var html;
  var nextImg = data.data[0].images.thumbnail.url;
  console.log(nextImg);
  html = '<img src="' + nextImg + '">';
  $('#imgWindow').prepend(html);
  if ($('#imgWindow > img').length > MAX_IMG_AMOUNT) {
    $('#imgWindow > img').last().remove();
  }
}
