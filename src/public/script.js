let map = L.map('map').setView([13.0827,80.2707],19);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

let userMarker;
let busMarker;
let routeLine;

let userLat;
let userLng;
let oldDistance=null;

let busIcon = L.icon({
iconUrl:"https://cdn-icons-png.flaticon.com/512/61/61231.png",
iconSize:[40,40]
});

// Get commuter location continuously
navigator.geolocation.watchPosition(

(position)=>{

userLat = position.coords.latitude;
userLng = position.coords.longitude;

if(!userMarker){

userMarker = L.marker([userLat,userLng])
.addTo(map)
.bindPopup("Your Location")
.openPopup();

map.setView([userLat,userLng],19);

}else{

userMarker.setLatLng([userLat,userLng]);

}

},

(error)=>{console.log(error);},

{
enableHighAccuracy:true,
maximumAge:0,
timeout:10000
}

);


// Fetch bus location every second
setInterval(()=>{

fetch("/bus-location")
.then(res=>res.json())
.then(data=>{

if(!data.lat) return;

// create marker first time
if(!busMarker){

busMarker = L.marker([data.lat,data.lng],{icon:busIcon})
.addTo(map)
.bindPopup("Bus Location");

}else{

// smoothly move marker
busMarker.setLatLng([data.lat,data.lng]);

}

// draw route
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

// distance
let distance = getDistance(userLat,userLng,data.lat,data.lng);

let status = "Distance: "+(distance*1000).toFixed(1)+" meters";

if(oldDistance!=null){

if(distance < oldDistance){
status += "<br>Bus moving towards you";
}else{
status += "<br>Bus moving away";
}

}

oldDistance = distance;

document.getElementById("status").innerHTML=status;

});

},1000);


// distance calculation
function getDistance(lat1,lon1,lat2,lon2){

const R=6371;

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