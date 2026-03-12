const map = L.map("map").setView([11.0168,76.9558],17)

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{
maxZoom:19
}).addTo(map)

const busIcon = L.icon({
iconUrl:"/bus.png",
iconSize:[40,40]
})

let userMarker

navigator.geolocation.watchPosition((pos)=>{

const lat = pos.coords.latitude
const lng = pos.coords.longitude

if(!userMarker){

userMarker = L.marker([lat,lng])
.addTo(map)
.bindPopup("Your Location")

map.setView([lat,lng],18)

}else{

userMarker.setLatLng([lat,lng])

}

})

const busMarkers = {}

function updateBus(){

fetch("/bus-data")

.then(res=>res.json())

.then(buses=>{

buses.forEach(bus=>{

if(!busMarkers[bus.id]){

busMarkers[bus.id] = L.marker(
[bus.lat,bus.lng],
{icon:busIcon}
)

.addTo(map)

.bindPopup(
"<b>"+bus.name+"</b><br>"+
"Crowd: "+bus.crowd+"<br>"+
"ETA: "+bus.eta
)

}else{

busMarkers[bus.id].setLatLng([bus.lat,bus.lng])

}

})

})

}

setInterval(updateBus,2000)