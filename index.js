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
	/*io.of('/').clients(function (error, client) {
        if (error) throw error;
        for (var i = 0; i < clientsRef.length; i++) {
            if (socket.id == clientsRef[i]) {
				console.log('Screen connected: ' + socket.id + '(' + i + ')');
            }
        }
    });*/

	var updateRemote = function(remote) {
		if (remote) {
			io.to(remote.socketId).emit('screensUpdated', remote.screens);
		}
	}
	
	var updateScreens = function(remote) {
		if (!remote.currentImage) {
			return;
		}
		
		var imageIndex = remote.currentImage.index;
		remote.screens.forEach(function(screen) {
			if (screen.active) {
				io.to(screen.socketId).emit('showImage', imageIndex);
				imageIndex = (imageIndex + 1) % remote.currentImage.count;
			}
		});
	}
	
	socket.on('addRemote', function () {
		var remote = { socketId: socket.id, screens: [] };
		screens.forEach(function(screen) {
			remote.screens.push({ socketId: screen.socketId, name: screen.name });
		});
		remotes.push(remote);
		updateRemote(remote);
	});

	socket.on('addScreen', function (screenName) {
		screens.push({ socketId: socket.id, name: screenName });
		remotes.forEach(function(remote) {
			remote.screens.push({ socketId: socket.id, name: screenName });
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

						// If screen is not active now, clear image on it
						if (!remotes[i].screens[j].active) {
							io.to(screen.socketId).emit('clearImage');
						}
					}
				});

				// Update remote to show button status (disconnect / connect)
				updateRemote(remote);
			}
		});
	});
	
	socket.on('disconnect', function () {
		// If a remote disconnected, clear images for all screens controlled by remote
		remotes.forEach(function(remote) {
			if (remote.socketId == socket.id) {
				remote.screens.forEach(function(screen) {
					io.to(screen.socketId).emit('clearImage');
				});
			}
		});
		
		// If a screen disconnected, delete screen from screens array and update view
		screens.forEach(function(screen, i) {
			if (screen.socketId == socket.id) {
				screens.splice(i, 1);
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