const socket = io();

// change this for each phone
const busId = prompt("Enter Bus ID (BUS1 or BUS2)");

const crowdLevels = ["Low","Medium","High"];
const crowd = crowdLevels[Math.floor(Math.random()*3)];

navigator.geolocation.watchPosition((position)=>{

const lat = position.coords.latitude;
const lng = position.coords.longitude;

socket.emit("busLocation",{
busId:busId,
lat:lat,
lng:lng,
crowd:crowd
});

},{
enableHighAccuracy:true,
maximumAge:0,
timeout:10000
});