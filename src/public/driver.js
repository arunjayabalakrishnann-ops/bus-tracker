const socket=io();

navigator.geolocation.watchPosition((position)=>{

const lat=position.coords.latitude;
const lng=position.coords.longitude;

socket.emit("busLocation",{lat,lng});

},{
enableHighAccuracy:true,
maximumAge:0,
timeout:10000
});