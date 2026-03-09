let map = L.map('map').setView([13.0827, 80.2707], 18);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
}).addTo(map);

let userMarker;
let busMarker;
let routeLine;

let userLat;
let userLng;

let oldDistance = null;

// Bus icon
let busIcon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/61/61231.png",
    iconSize: [40,40]
});

// Get commuter location
navigator.geolocation.watchPosition(

(position)=>{

userLat = position.coords.latitude;
userLng = position.coords.longitude;

// create commuter marker once
if(!userMarker){
userMarker = L.marker([userLat,userLng])
.addTo(map)
.bindPopup("Your Location")
.openPopup();

map.setView([userLat,userLng],18);
}else{
userMarker.setLatLng([userLat,userLng]);
}

// update bus location every second
fetch("/bus-location")
.then(res=>res.json())
.then(data=>{

if(!data.lat) return;

// create or update bus marker
if(!busMarker){
busMarker = L.marker([data.lat,data.lng],{icon:busIcon})
.addTo(map)
.bindPopup("Bus Location");
}else{
busMarker.setLatLng([data.lat,data.lng]);
}

// draw route line
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

// auto adjust map bounds
let bounds = L.latLngBounds([
[userLat,userLng],
[data.lat,data.lng]
]);

map.fitBounds(bounds);

// calculate distance
let distance = getDistance(userLat,userLng,data.lat,data.lng);

let statusText = "Distance: " + (distance*1000).toFixed(1) + " meters";

if(oldDistance !== null){

if(distance < oldDistance){
statusText += "<br>Bus is moving towards you";
}
else if(distance > oldDistance){
statusText += "<br>Bus is moving away from you";
}

}

oldDistance = distance;

document.getElementById("status").innerHTML = statusText;

});

},

(error)=>{
alert("Location permission required.");
},

{
enableHighAccuracy:true,
maximumAge:0,
timeout:10000
}

);


// Haversine distance calculation
function getDistance(lat1,lon1,lat2,lon2){

const R = 6371;

let dLat = (lat2-lat1) * Math.PI/180;
let dLon = (lon2-lon1) * Math.PI/180;

let a =
Math.sin(dLat/2)*Math.sin(dLat/2) +
Math.cos(lat1*Math.PI/180) *
Math.cos(lat2*Math.PI/180) *
Math.sin(dLon/2)*Math.sin(dLon/2);

let c = 2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));

return R*c;

}