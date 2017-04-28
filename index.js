var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var clientsRef;
var screenIndex = 0;

app.use(express.static('public'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/screen.html');
});

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/remote.html');
});

io.on('connection', function (socket) {
//io.of('/').clients(function (error, clients) {
//        if (error) throw error;
//        clientsRef = clients;
//        for (var i = 0; i < clientsRef.length; i++)
//        {
//            if (socket.id == clientsRef[i])
//            {
//                socket.emit('deviceIndex', i);
//                screenIndex = i;
//            }
//        }
//    })

    //console.log('Screen connected: ' + socket.id + '(' + screenIndex + ')');



    socket.on('disconnect', function () {
        console.log('user disconnected');
    });

    socket.on('image', function (index) {
        console.log('image:' + index);
        io.emit('imageToScreen', index);
    });
});


http.listen(8080, function () {
    console.log('listening on *:8080');
});