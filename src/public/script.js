const socket = io();

// create map
const map = L.map('map').setView([11.0168, 76.9558], 18);

// map tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
maxZoom: 19
}).addTo(map);


// BUS ICON
const busIcon = L.icon({
iconUrl: "https://cdn-icons-png.flaticon.com/512/61/61231.png",
iconSize: [40,40],
iconAnchor: [20,20]
});


let busMarker = null;
let userMarker = null;


// receive bus GPS
socket.on("busLocation",(data)=>{

const lat = data.lat;
const lng = data.lng;
const busName = data.busId;
const crowd = data.crowd;

if(!busMarker){

busMarker = L.marker([lat,lng],{
icon: busIcon
}).addTo(map);

}

busMarker.setLatLng([lat,lng]);

busMarker.bindPopup(
"<b>"+busName+"</b><br>" +
"Crowd: "+crowd
);

});


// commuter location
navigator.geolocation.watchPosition((pos)=>{

const lat = pos.coords.latitude;
const lng = pos.coords.longitude;

if(!userMarker){

userMarker = L.marker([lat,lng]).addTo(map)
.bindPopup("You are here");

map.setView([lat,lng],18);

}else{

userMarker.setLatLng([lat,lng]);

}

},{
enableHighAccuracy:true,
maximumAge:0,
timeout:5000
});