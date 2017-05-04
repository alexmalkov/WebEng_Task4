'use strict';

var currentImage = 0; // the currently selected image
var imageCount = 7; // the maximum number of images available
var socket;
var rotationRates = [];
var eventsPerPhase = 5;
var betaThreshold = 10;
var inRecoilPhase = false;

function showImage(index) {
    // Update selection on remote
    currentImage = index;
	showCurrentImage();
}

function showCurrentImage() {
    var images = document.querySelectorAll("img");
    document.querySelector("img.selected").classList.toggle("selected");
    images[currentImage].classList.toggle("selected");
	
    socket.emit('imageClicked', { index: currentImage, count: imageCount });
}

function initialiseGallery() {
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

if (window.DeviceMotionEvent) {
	window.addEventListener('devicemotion', function(eventData) {
		rotationRates.push(eventData.rotationRate);
		if (rotationRates.length >= eventsPerPhase) {
			if (inRecoilPhase) {
				inRecoilPhase = false;
			} else {
				for (var i = 0; i < rotationRates.length; i++) {
					let beta = rotationRates[i].beta;
					if (Math.abs(beta) > betaThreshold) {
						inRecoilPhase = true;
						if (beta > betaThreshold) {
							showNextImage();
						} else if (beta < -betaThreshold) {
							showPreviousImage();
						}
						break;
					}
				}
			}
			rotationRates = [];
		}
  }, false);
}

function showPreviousImage() {
	currentImage = (currentImage - 1 + imageCount) % imageCount;
	showCurrentImage();
}

function showNextImage() {
	currentImage = (currentImage + 1 + imageCount) % imageCount;
	showCurrentImage();
}

if (window.DeviceOrientationEvent) {
	window.addEventListener('deviceorientation', function(eventData) {
    	socket.emit('zoom', eventData.beta);
	}, false);
}