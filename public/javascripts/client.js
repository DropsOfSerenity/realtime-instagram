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
    var html = '<a style="display: inline-block; min-width: 150px; min-height: 150px;" href="' + link + '"><img src="' + nextImg + '"></a>';
    $('#imgWindow').prepend(html);
  });
});

function appendNewImage(data) {
  var nextImg = data.data[0].images.thumbnail.url;
  var link = data.data[0].link;

  // find a random image
  var random = Math.floor(Math.random() * 20);

  var ele = $('#imgWindow a').eq(random);
  ele.attr('href', link);
  var img = ele.find('img');

  img.fadeOut(300, function() {
    $(this).attr('src', nextImg).bind('onreadystatechange load', function(){
       if (this.complete) $(this).fadeIn(300);
    });
  });
}
