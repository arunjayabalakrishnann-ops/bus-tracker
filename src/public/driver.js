const socket = io();

function sendLocation(position){

const lat = position.coords.latitude;
const lng = position.coords.longitude;
const accuracy = position.coords.accuracy;

if(accuracy < 50){

socket.emit("busLocation",{lat,lng});

}

}

function error(err){
console.log(err);
}

navigator.geolocation.watchPosition(sendLocation,error,{
enableHighAccuracy:true,
maximumAge:0,
timeout:10000
});