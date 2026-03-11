const socket = io();

// Ask which bus
const busId = prompt("Enter Bus Name (BUS1 or BUS2)");

const crowdLevels = ["Low","Medium","High"];

navigator.geolocation.watchPosition((pos)=>{

    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;

    const crowd = crowdLevels[Math.floor(Math.random()*3)];

    socket.emit("busLocation",{

        busId: busId,
        lat: lat,
        lng: lng,
        crowd: crowd

    });

},{
    enableHighAccuracy:true,
    maximumAge:0,
    timeout:10000
});