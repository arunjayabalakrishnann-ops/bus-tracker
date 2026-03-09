const socket = io();

var map = L.map('map').setView([13.0827,80.2707],17);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
maxZoom:19
}).addTo(map);

let busMarker = null;
let userMarker = null;

let routeLine = L.polyline([],{
color:"blue",
weight:6
}).addTo(map);

socket.on("busLocation",(data)=>{

let lat = data.lat;
let lng = data.lng;

if(!busMarker){

busMarker = L.marker([lat,lng]).addTo(map)
.bindPopup("Bus Location");

}else{

busMarker.setLatLng([lat,lng]);

}

routeLine.addLatLng([lat,lng]);

});

navigator.geolocation.watchPosition((position)=>{

let lat = position.coords.latitude;
let lng = position.coords.longitude;

if(!userMarker){

userMarker = L.marker([lat,lng]).addTo(map)
.bindPopup("Your Location");

}else{

userMarker.setLatLng([lat,lng]);

}

},{
enableHighAccuracy:true
});