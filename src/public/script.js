const socket = io();

const map = L.map('map').setView([11.0168,76.9558],18);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
maxZoom:19
}).addTo(map);


// bus icon
const busIcon = L.icon({
iconUrl: "/bus.png",
iconSize: [50,50],
iconAnchor: [25,25]
});

let buses = {};
let userMarker = null;


// bus gps
socket.on("busLocation",(data)=>{

const id = data.busId;
const lat = data.lat;
const lng = data.lng;
const crowd = data.crowd;

if(!buses[id]){

buses[id] = L.marker([lat,lng],{
icon: busIcon
}).addTo(map);

}

buses[id].setLatLng([lat,lng]);

buses[id].bindPopup(
"<b>"+id+"</b><br>Crowd: "+crowd
);

});


// user location
navigator.geolocation.watchPosition((pos)=>{

const lat = pos.coords.latitude;
const lng = pos.coords.longitude;

if(!userMarker){

userMarker = L.marker([lat,lng]).addTo(map)
.bindPopup("Your Location");

map.setView([lat,lng],18);

}else{

userMarker.setLatLng([lat,lng]);

}

},{
enableHighAccuracy:true
});