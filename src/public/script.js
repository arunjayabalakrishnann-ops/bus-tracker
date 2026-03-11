const socket = io();

// create map
const map = L.map('map').setView([11.0168,76.9558],18);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
maxZoom:19
}).addTo(map);


// BUS ICON
const busIcon = L.icon({
iconUrl: "bus.png",
iconSize: [45,45],
iconAnchor: [22,22]
});


let buses = {};
let userMarker;


// distance function
function getDistance(lat1,lon1,lat2,lon2){

const R = 6371;

const dLat = (lat2-lat1)*Math.PI/180;
const dLon = (lon2-lon1)*Math.PI/180;

const a =
Math.sin(dLat/2)*Math.sin(dLat/2) +
Math.cos(lat1*Math.PI/180) *
Math.cos(lat2*Math.PI/180) *
Math.sin(dLon/2)*Math.sin(dLon/2);

const c = 2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));

return R*c;

}


// receive bus gps
socket.on("busLocation",(data)=>{

const id = data.busId;
const lat = data.lat;
const lng = data.lng;
const crowd = data.crowd;


// create bus marker
if(!buses[id]){

buses[id] = L.marker([lat,lng],{
icon: busIcon
}).addTo(map);

}


// move bus
buses[id].setLatLng([lat,lng]);


// popup details
buses[id].bindPopup(

"<b>"+id+"</b><br>"+
"Crowd Level: "+crowd

);

});


// commuter location
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