'use strict';

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var remotes = [];
var screens = [];

app.use(express.static('public'));

/*app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/screen.html');
});*/

/*app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/remote.html');
});*/

io.on('connection', function (socket) {
	var updateRemote = function(remote) {
		io.to(remote.socketId).emit('screensUpdated', remote.screens);
	}
	
	var updateScreens = function(remote) {
		var imageIndex = remote.currentImage.index;
		remote.screens.forEach(function(screen) {
			if (screen.active) {
				io.to(screen.socketId).emit('showImage', imageIndex);
				imageIndex = (imageIndex + 1) % remote.currentImage.count;
			}
		});
	}
	
	socket.on('addRemote', function (image) {
		var remote = { socketId: socket.id, screens: [], currentImage: image };
		screens.forEach(function(screen) {
			remote.screens.push({ socketId: screen.socketId, name: screen.name, active: false });
		});
		remotes.push(remote);
		updateRemote(remote);
	});

	socket.on('addScreen', function (screenName) {
		var screen = { socketId: socket.id, name: screenName, active: false };
		screens.push(screen);
		remotes.forEach(function(remote) {
			remote.screens.push({ socketId: screen.socketId, name: screen.name, active: false });
			updateRemote(remote);
		});
	});

	socket.on('imageClicked', function (image) {
		remotes.forEach(function(remote, i) {
			if (remote.socketId == socket.id) {
				remotes[i].currentImage = image;
				updateScreens(remote);
			}
		});
	});

	socket.on('toggleScreen', function (socketId) {
		remotes.forEach(function(remote, i) {
			if (remote.socketId == socket.id) {
				remote.screens.forEach(function(screen, j) {
					if (screen.socketId == socketId) {
						// Toggle screen active
						remotes[i].screens[j].active = !screen.active;
						if (!remotes[i].screens[j].active) {
							io.to(screen.socketId).emit('clearImage');
						}
					}
				});
				
				// Update screens
				updateScreens(remote);
				// Update remote to show button status (disconnect / connect)
				updateRemote(remote);
			}
		});
	});
	
	socket.on('zoom', function(beta) {
		remotes.forEach(function(remote, i) {
			if (remote.socketId == socket.id) {
				remote.screens.forEach(function(screen) {
					io.to(screen.socketId).emit('zoom', beta);
				});
			}
		});
	});
	
	socket.on('disconnect', function() {
		// If a remote disconnected, clear images for all screens controlled by remote
		remotes.forEach(function(remote, i) {
			if (remote.socketId == socket.id) {
				remote.screens.forEach(function(screen) {
					io.to(screen.socketId).emit('clearImage');
				});
				remotes.splice(i, 1);
			}
		});
		
		// If a screen disconnected, delete screen from screens array and update view
		screens.forEach(function(screen, j) {
			if (screen.socketId == socket.id) {
				screens.splice(j, 1);
			}
		});
		remotes.forEach(function(remote, i) {
			remote.screens.forEach(function(screen, j) {
				if (screen.socketId == socket.id) {
					remotes[i].screens.splice(j, 1);
				}
			});
			// Update remote
			updateRemote(remote);
			// Update image order for other screens
			updateScreens(remote);
		});
	});
});

http.listen(8080, function () {
    console.log('listening on *:8080');
});