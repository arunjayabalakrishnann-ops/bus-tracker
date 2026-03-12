navigator.geolocation.watchPosition((pos)=>{

const lat = pos.coords.latitude
const lng = pos.coords.longitude

const busId = document.getElementById("busId").value

fetch("/update-bus",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
id:busId,
lat:lat,
lng:lng
})

})

},{
enableHighAccuracy:true
})