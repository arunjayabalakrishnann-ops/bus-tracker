const socket = io();

function sendLocation(position){

let lat = position.coords.latitude;
let lng = position.coords.longitude;

socket.emit("busLocation",{lat,lng});

}

function error(){
alert("Unable to get location");
}

navigator.geolocation.watchPosition(sendLocation,error,{
enableHighAccuracy:true,
maximumAge:0,
timeout:5000
});