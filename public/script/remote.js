var currentImage = 0; // the currently selected image
var imageCount = 7; // the maximum number of images available


function showImage (index){
    // Update selection on remote
    currentImage = index;
    var images = document.querySelectorAll("img");
    document.querySelector("img.selected").classList.toggle("selected");
    images[index].classList.toggle("selected");

    io().emit('image', index);
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
        img.addEventListener("click",handler);
    }

    document.querySelector("img").classList.toggle('selected');
}

document.addEventListener("DOMContentLoaded", function(event) {
    initialiseGallery();

    document.querySelector('#toggleMenu').addEventListener("click", function(event){
        var style = document.querySelector('#menu').style;
        style.display = style.display == "none" || style.display == "" ? "block" : "none";

        //io().on('deviceIndex', function (deviceIndex) {
        //    $('#devices').append($('<li>').text('Screen' + deviceIndex)).append($('<button>Connect</button>'));
        //});

    });
    connectToServer();
});

function connectToServer(){
    var socket = io();
}

