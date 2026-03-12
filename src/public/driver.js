const busName = prompt("Enter Bus Name (BUS1 or BUS2)");
const crowd = prompt("Crowd Level (Low / Medium / High)");

navigator.geolocation.watchPosition(pos=>{

const lat=pos.coords.latitude;
const lng=pos.coords.longitude;

fetch("/update-bus",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
name:busName,
lat:lat,
lng:lng,
crowd:crowd
})

});

},{
enableHighAccuracy:true
});