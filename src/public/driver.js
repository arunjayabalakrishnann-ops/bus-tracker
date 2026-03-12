const busId=prompt("Enter Bus Name (BUS1 or BUS2)");

const crowd=prompt("Crowd Level (Low / Medium / High)");

navigator.geolocation.watchPosition(pos=>{

const lat=pos.coords.latitude;
const lng=pos.coords.longitude;

db.ref("buses/"+busId).set({

name:busId,
lat:lat,
lng:lng,
crowd:crowd,
eta:Math.floor(Math.random()*10+1)

});

},{
enableHighAccuracy:true
});