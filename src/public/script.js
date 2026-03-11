const socket = io();

const map = L.map('map').setView([13.0827,80.2707],19);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
maxZoom:19
}).addTo(map);

// bus icon
const busIcon = L.icon({
iconUrl:"bus.png",
iconSize:[40,40]
});

let userMarker=null;

let buses={};

let previousDistances={};

function getDistance(lat1,lon1,lat2,lon2){

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

const id=data.busId;
const lat=data.lat;
const lng=data.lng;
const crowd=data.crowd;

if(!buses[id]){

buses[id]=L.marker([lat,lng],{icon:busIcon})
.addTo(map)
.bindPopup(id);

}else{

buses[id].setLatLng([lat,lng]);

}

if(userMarker){

const user=userMarker.getLatLng();

const dist=getDistance(user.lat,user.lng,lat,lng);

const meters=(dist*1000).toFixed(0);

let direction="--";

if(previousDistances[id]){

if(dist<previousDistances[id]){
direction="Approaching";
}else{
direction="Moving Away";
}

}

previousDistances[id]=dist;

const speed=20;

const eta=(dist/speed)*60;

buses[id].bindPopup(
id+
"<br>Distance: "+meters+" m"+
"<br>Direction: "+direction+
"<br>ETA: "+eta.toFixed(1)+" min"+
"<br>Crowd: "+crowd
);

}

});

// user location
navigator.geolocation.watchPosition((position)=>{

const lat=position.coords.latitude;
const lng=position.coords.longitude;

if(!userMarker){

userMarker=L.marker([lat,lng])
.addTo(map)
.bindPopup("You");

map.setView([lat,lng],19);

}else{

userMarker.setLatLng([lat,lng]);

}

},{
enableHighAccuracy:true
});