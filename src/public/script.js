let map = L.map('map').setView([13.0827,80.2707],19);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{}).addTo(map);

let userMarker;
let busMarker;
let routeLine;

let userLat;
let userLng;

let oldDistance=null;

// Bus icon
let busIcon = L.icon({
iconUrl:"https://cdn-icons-png.flaticon.com/512/61/61231.png",
iconSize:[40,40]
});

// Get commuter location
navigator.geolocation.watchPosition(

function(position){

userLat = position.coords.latitude;
userLng = position.coords.longitude;

// Create commuter marker
if(!userMarker){

userMarker = L.marker([userLat,userLng])
.addTo(map)
.bindPopup("Commuter Location")
.openPopup();

map.setView([userLat,userLng],19);

}else{

userMarker.setLatLng([userLat,userLng]);

}

},

function(error){
console.log(error);
},

{
enableHighAccuracy:true,
maximumAge:0,
timeout:10000
}

);


// Update bus location every 5 seconds
setInterval(()=>{

fetch("/bus-location")
.then(res=>res.json())
.then(data=>{

if(!data.lat) return;

// Create or update bus marker
if(!busMarker){

busMarker = L.marker([data.lat,data.lng],{icon:busIcon})
.addTo(map)
.bindPopup("Bus Location");

}else{

busMarker.setLatLng([data.lat,data.lng]);

}

// Draw route line
if(routeLine){
map.removeLayer(routeLine);
}

routeLine = L.polyline([
[userLat,userLng],
[data.lat,data.lng]
],{
color:"blue",
weight:4
}).addTo(map);

// Fit both markers in view
let bounds = L.latLngBounds([
[userLat,userLng],
[data.lat,data.lng]
]);

map.fitBounds(bounds);

// Calculate distance
let distance = getDistance(userLat,userLng,data.lat,data.lng);

let statusText = "Distance: " + (distance*1000).toFixed(1) + " meters";

if(oldDistance !== null){

if(distance < oldDistance){
statusText += "<br>Bus moving towards you";
}
else{
statusText += "<br>Bus moving away from you";
}

}

oldDistance = distance;

document.getElementById("status").innerHTML = statusText;

});

},5000);


// Haversine distance formula
function getDistance(lat1,lon1,lat2,lon2){

const R = 6371;

let dLat=(lat2-lat1)*Math.PI/180;
let dLon=(lon2-lon1)*Math.PI/180;

let a=
Math.sin(dLat/2)*Math.sin(dLat/2)+
Math.cos(lat1*Math.PI/180)*
Math.cos(lat2*Math.PI/180)*
Math.sin(dLon/2)*Math.sin(dLon/2);

let c=2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));

return R*c;

}