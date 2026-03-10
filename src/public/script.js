const socket = io();

const map = L.map('map').setView([13.0827,80.2707],19);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
maxZoom:19
}).addTo(map);

let busMarker=null;
let userMarker=null;
let previousDistance=null;

const busIcon=L.icon({
iconUrl:"https://cdn-icons-png.flaticon.com/512/61/61231.png",
iconSize:[35,35]
});

const routeLine=L.polyline([],{
color:"blue",
weight:5
}).addTo(map);

const stops=[
[13.0827,80.2707,"College Gate"],
[13.0830,80.2710,"Library"],
[13.0834,80.2714,"Admin Block"],
[13.0837,80.2718,"Hostel"]
];

stops.forEach(stop=>{
L.marker([stop[0],stop[1]])
.addTo(map)
.bindPopup(stop[2]);
});

function distance(lat1,lon1,lat2,lon2){

const R=6371;

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

document.getElementById("status").innerText="Driver Status: Active";

const lat=data.lat;
const lng=data.lng;

if(!busMarker){

busMarker=L.marker([lat,lng],{icon:busIcon}).addTo(map);

}else{

busMarker.setLatLng([lat,lng]);

}

routeLine.addLatLng([lat,lng]);

document.getElementById("update").innerText=
"Last Update: "+new Date().toLocaleTimeString();

if(userMarker){

const user=userMarker.getLatLng();

const dist=distance(user.lat,user.lng,lat,lng);

document.getElementById("distance").innerText=
"Distance: "+(dist*1000).toFixed(0)+" meters";

const speed=20;

const eta=(dist/speed)*60;

document.getElementById("eta").innerText=
"ETA: "+eta.toFixed(1)+" min";

if(previousDistance!==null){

if(dist<previousDistance){

document.getElementById("direction").innerText=
"Direction: Bus approaching";

}else{

document.getElementById("direction").innerText=
"Direction: Bus moving away";

}

}

previousDistance=dist;

}

});

navigator.geolocation.watchPosition((position)=>{

const lat=position.coords.latitude;
const lng=position.coords.longitude;

if(!userMarker){

userMarker=L.marker([lat,lng]).addTo(map)
.bindPopup("Your Location");

map.setView([lat,lng],19);

}else{

userMarker.setLatLng([lat,lng]);

}

},{
enableHighAccuracy:true
});