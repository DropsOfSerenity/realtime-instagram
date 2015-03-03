'use strict';

var socket = io.connect('https://instagram-realtime-test.herokuapp.com');
var MAX_IMG_AMOUNT = 20;

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
  var imgs = data.firstLoad.slice(0, MAX_IMG_AMOUNT);
  $('#imgWindow > img').remove();
  imgs.forEach(function(img) {
    console.log(img);
    var nextImg = img.images.thumbnail.url;
    var html = '<img src="' + nextImg + '">';
    $('#imgWindow').prepend(html);
  });
});

function appendNewImage(data) {
  var html;
  var nextImg = data.data[0].images.thumbnail.url;
  console.log(nextImg);
  html = '<img src="' + nextImg + '">';

  $('#imgWindow').prepend(html);
  var last = $('#imgWindow > img:first-child');
  var next = $('#imgWindow > img:nth-child(2)');

  // if this is a dupe, remove
  if(last.attr('src') === next.attr('src')) {
    last.remove();
  }

  $('#imgWindow').find(':nth-child(1)').addClass('animated fadeInDown'); 
  $('#imgWindow').find(':nth-child(2)').addClass('animated fadeInLeft');

  while($('#imgWindow > img').length > MAX_IMG_AMOUNT) {
    $('#imgWindow > img').last().remove();
  }
}
