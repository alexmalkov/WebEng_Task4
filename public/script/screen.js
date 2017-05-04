'use strict';

var deviceName; // the name of this screen and specified in the URL
var imageCount = 7; // the maximum number of images available
//var clientRef = [];

document.addEventListener("DOMContentLoaded", function(event) {
    deviceName = getQueryParams().name;
    if (deviceName) {
        var text = document.querySelector('#name');
        text.textContent = deviceName;
    }

    connectToServer();
});

function showImage (index) {
    var img = document.querySelector('#image');
    var msg = document.querySelector('#msg');
    if (index >= 0 && index <= imageCount){
        img.setAttribute("src", "images/" +index +".jpg");
        msg.style.display = 'none';
        img.style.display = 'block';
    }
}

function clearImage(){
    var img = document.querySelector('#image');
    var msg = document.querySelector('#msg');
    img.style.display = 'none';
    msg.style.display = 'block';
}

function getQueryParams() {
    var qs =  window.location.search.split("+").join(" ");

    var params = {}, tokens,
        re = /[?&]?([^=]+)=([^&]*)/g;

    while (tokens = re.exec(qs)) {
        params[decodeURIComponent(tokens[1])]
            = decodeURIComponent(tokens[2]);
    }

    return params;
}


function connectToServer() {
    var socket = io();
	
	socket.emit('addScreen', deviceName);
	
    socket.on('showImage', function(imageIndex) {
		showImage(imageIndex);
    });
	
	socket.on('clearImage', function() {
		clearImage();
	});
	
	socket.on('zoom', function(beta) {
		/*var scale = 1;
		if (15 <= beta && beta < 30) {
			scale = 0.8;
		} else if (30 <= beta && beta <45) {
			scale = 0.6;
		} else if (45 <= beta && beta < 60) {
			scale = 0.4;
		} else if (60 <= beta) {
			scale = 0.2;
		}*/
		//$('#image').css({ 'transform': 'scale(' + scale + ', ' + scale + ')' });
		var height = '100vh';
		if (15 <= beta && beta < 30) {
			height = '90vh';
		} else if (30 <= beta && beta <45) {
			height = '80vh';
		} else if (45 <= beta && beta < 60) {
			height = '70vh';
		} else if (60 <= beta) {
			height = '60vh';
		}
		$('#image').css({ 'height': height });
	});
}