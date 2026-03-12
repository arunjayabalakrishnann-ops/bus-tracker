const map = L.map("map").setView([11.0168,76.9558],17);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{
maxZoom:19
}).addTo(map);


// BUS ICON
const busIcon = L.icon({
iconUrl:"/bus.png",
iconSize:[40,40],
iconAnchor:[20,20]
});

let userMarker;
let buses={};


// DISTANCE FUNCTION
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


// USER LOCATION
navigator.geolocation.watchPosition(pos=>{

const lat=pos.coords.latitude;
const lng=pos.coords.longitude;

if(!userMarker){

userMarker=L.marker([lat,lng])
.addTo(map)
.bindPopup("Your Location");

map.setView([lat,lng],18);

}else{

userMarker.setLatLng([lat,lng]);

}


// FETCH BUS DATA
fetch("/bus-data")
.then(res=>res.json())
.then(data=>{

data.forEach(bus=>{

const d=distance(lat,lng,bus.lat,bus.lng);
const eta=(d/20*60).toFixed(1);

const info=
"<b>"+bus.name+"</b><br>"+
"Distance: "+d.toFixed(2)+" km<br>"+
"ETA: "+eta+" min<br>"+
"Crowd: "+bus.crowd;

if(!buses[bus.name]){

buses[bus.name]=L.marker([bus.lat,bus.lng],{icon:busIcon})
.addTo(map)
.bindPopup(info);

}else{

buses[bus.name].setLatLng([bus.lat,bus.lng]);
buses[bus.name].setPopupContent(info);

}

});

});

},{
enableHighAccuracy:true
});