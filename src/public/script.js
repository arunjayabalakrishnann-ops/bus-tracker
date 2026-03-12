const socket = io();

// create map
const map = L.map('map').setView([11.0168,76.9558],18);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
maxZoom:19
}).addTo(map);


// BUS ICON (ONLINE IMAGE – WILL DEFINITELY SHOW)
const busIcon = L.icon({
iconUrl: "https://cdn-icons-png.flaticon.com/512/61/61231.png",
iconSize: [40,40],
iconAnchor: [20,20]
});


let buses = {};
let userMarker;


// receive bus location
socket.on("busLocation",(data)=>{

const id = data.busId;
const lat = data.lat;
const lng = data.lng;
const crowd = data.crowd;


// create bus marker
if(!buses[id]){

buses[id] = L.marker([lat,lng],{icon:busIcon}).addTo(map);

}


// move bus
buses[id].setLatLng([lat,lng]);


// popup info
buses[id].bindPopup(
"<b>"+id+"</b><br>" +
"Crowd: "+crowd
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