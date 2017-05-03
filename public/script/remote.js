'use strict';

var currentImage = 0; // the currently selected image
var imageCount = 7; // the maximum number of images available
var socket;

function showImage (index){
    // Update selection on remote
    currentImage = index;
    var images = document.querySelectorAll("img");
    document.querySelector("img.selected").classList.toggle("selected");
    images[index].classList.toggle("selected");
	
    socket.emit('imageClicked', { index: index, count: imageCount });
}

function initialiseGallery(){
    var container = document.querySelector('#gallery');
    var i, img;
    for (i = 0; i < imageCount; i++) {
        img = document.createElement("img");
        img.src = "images/" +i +".jpg";
        document.body.appendChild(img);
        var handler = (function(index) {
            return function() {
                showImage(index);
            }
        })(i);
        img.addEventListener("click", handler);
    }

    document.querySelector("img").classList.toggle('selected');
}

document.addEventListener("DOMContentLoaded", function(event) {
    initialiseGallery();

    document.querySelector('#toggleMenu').addEventListener("click", function(event){
        var style = document.querySelector('#menu').style;
        style.display = style.display == "none" || style.display == "" ? "block" : "none";
    });
    connectToServer();
});

function connectToServer() {
    socket = io();
	
	socket.emit('addRemote', { index: currentImage, count: imageCount });
	
	socket.on('screensUpdated', function(screens) {
		var devices = $('#devices');
		devices.empty();
		
		screens.forEach(function(screen, i) {
			var button = document.createElement("button");
			button.className += ' pure-button';
			button.innerHTML = screen.active ? 'Disconnect' : 'Connect';
			
			devices.append('<li>Screen ' + screen.name + button.outerHTML + '</li>');
			
			var handler = (function(socketId) {
				return function() {
					socket.emit('toggleScreen', socketId);
				}
			})(screen.socketId);
			devices[0].children[i].children[0].addEventListener("click", handler);
		});
	});
}

