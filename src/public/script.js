const socket = io();

const map = L.map('map').setView([13.0827,80.2707],19);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
maxZoom:19
}).addTo(map);

let busMarker = null;
let userMarker = null;

let routeLine = L.polyline([],{
color:"blue",
weight:5
}).addTo(map);

function getDistance(lat1,lon1,lat2,lon2){

const R = 6371;

const dLat=(lat2-lat1)*Math.PI/180;
const dLon=(lon2-lon1)*Math.PI/180;

const a=
Math.sin(dLat/2)*Math.sin(dLat/2)+
Math.cos(lat1*Math.PI/180)*
Math.cos(lat2*Math.PI/180)*
Math.sin(dLon/2)*Math.sin(dLon/2);

const c=2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));

return R*c;

}

socket.on("busLocation",(data)=>{

const lat=data.lat;
const lng=data.lng;

if(!busMarker){

busMarker=L.marker([lat,lng]).addTo(map)
.bindPopup("Bus Location");

}else{

busMarker.setLatLng([lat,lng]);

}

routeLine.addLatLng([lat,lng]);

if(userMarker){

const user=userMarker.getLatLng();

const distance=getDistance(user.lat,user.lng,lat,lng);

console.log("Distance to bus:",distance.toFixed(3),"km");

}

});

navigator.geolocation.watchPosition(

(position)=>{

const lat=position.coords.latitude;
const lng=position.coords.longitude;

if(!userMarker){

userMarker=L.marker([lat,lng]).addTo(map)
.bindPopup("Your Location");

map.setView([lat,lng],19);

}else{

userMarker.setLatLng([lat,lng]);

}

},

(error)=>{

console.log(error);

},

{

enableHighAccuracy:true,
maximumAge:0,
timeout:15000

}

);