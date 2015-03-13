'use strict';

var socket = io.connect('https://instagram-realtime-test.herokuapp.com');
var MAX_IMG_AMOUNT = 20;

socket.on('love', function(data) {
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
  var reversedData = data.firstLoad.reverse();
  var imgs = reversedData.slice(0, MAX_IMG_AMOUNT);
  $('#imgWindow > a').remove();
  imgs.forEach(function(img) {
    var nextImg = img.images.thumbnail.url;
    var link = img.link;
    var html = '<a href="' + link + '"><img src="' + nextImg + '"></a>';
    $('#imgWindow').prepend(html);
  });
});

function appendNewImage(data) {
  var nextImg = data.data[0].images.thumbnail.url;
  var link = data.data[0].link;
  var html = '<a href="' + link + '"><img src="' + nextImg + '"></a>';

  $('#imgWindow').prepend(html);
  var last = $('#imgWindow > a:first-child');
  var next = $('#imgWindow > a:nth-child(2)');

  // if this is a dupe, remove
  if(last.find('img').attr('src') === next.find('img').attr('src')) {
    last.remove();
  }

  $('#imgWindow').find(':nth-child(1)').addClass('animated fadeInDown');
  $('#imgWindow').find(':nth-child(2)').addClass('animated fadeInLeft');

  while($('#imgWindow > a').length > MAX_IMG_AMOUNT) {
    $('#imgWindow > a').last().remove();
  }
}
