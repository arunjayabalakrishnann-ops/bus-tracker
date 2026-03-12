const map = L.map("map").setView([11.0168,76.9558],17);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{
maxZoom:19
}).addTo(map);


// BUS ICON
const busIcon=L.icon({
iconUrl:"bus.png",
iconSize:[40,40]
});

let userMarker;
let buses={};


// USER LOCATION
navigator.geolocation.watchPosition(pos=>{

const lat=pos.coords.latitude;
const lng=pos.coords.longitude;

if(!userMarker){

userMarker=L.marker([lat,lng]).addTo(map)
.bindPopup("You");

map.setView([lat,lng],18);

}else{

userMarker.setLatLng([lat,lng]);

}

});


// FIREBASE BUS TRACKING
db.ref("buses").on("value",snapshot=>{

const data=snapshot.val();

for(let id in data){

const bus=data[id];

const lat=bus.lat;
const lng=bus.lng;

const info=
"<b>"+bus.name+"</b><br>"+
"Crowd: "+bus.crowd+"<br>"+
"ETA: "+bus.eta+" min";

if(!buses[id]){

buses[id]=L.marker([lat,lng],{icon:busIcon})
.addTo(map)
.bindPopup(info);

}else{

buses[id].setLatLng([lat,lng]);
buses[id].setPopupContent(info);

}

}

});