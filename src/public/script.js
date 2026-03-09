const socket = io();

var map = L.map('map').setView([13.0827, 80.2707], 13); // Chennai default

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
maxZoom:19
}).addTo(map);

let busMarker = null;
let routeLine = L.polyline([], {color:'blue'}).addTo(map);

socket.on("busLocation",(data)=>{

let lat = data.lat;
let lng = data.lng;

if(!busMarker){

busMarker = L.marker([lat,lng]).addTo(map)
.bindPopup("Bus Location")
.openPopup();

}else{

busMarker.setLatLng([lat,lng]);

}

routeLine.addLatLng([lat,lng]);

map.panTo([lat,lng]);

});