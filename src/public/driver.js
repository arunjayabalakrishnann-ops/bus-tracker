const socket = io();

let lastLat=null;
let lastLng=null;

navigator.geolocation.watchPosition(

(position)=>{

const lat=position.coords.latitude;
const lng=position.coords.longitude;
const accuracy=position.coords.accuracy;

console.log("Driver accuracy:",accuracy);

if(accuracy>60) return;

if(lastLat){

const diff=Math.sqrt(
Math.pow(lat-lastLat,2)+
Math.pow(lng-lastLng,2)
);

if(diff<0.00001){
return;
}

}

lastLat=lat;
lastLng=lng;

socket.emit("busLocation",{lat,lng});

},

(error)=>{
console.log(error);
},

{

enableHighAccuracy:true,
maximumAge:0,
timeout:15000

}

);