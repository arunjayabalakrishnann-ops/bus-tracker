const express = require("express")
const path = require("path")

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

// SERVE PUBLIC FILES
app.use(express.static(path.join(__dirname,"src/public")))

// BUS DATA
let buses = [
{
id:1,
name:"Campus Bus A",
lat:11.0168,
lng:76.9558,
crowd:"Medium",
eta:"5 mins"
},
{
id:2,
name:"Campus Bus B",
lat:11.0170,
lng:76.9560,
crowd:"Low",
eta:"7 mins"
}
]

// DRIVER UPDATES
app.post("/update-bus",(req,res)=>{

const {id,lat,lng} = req.body

const bus = buses.find(b=>b.id==id)

if(bus){
bus.lat = lat
bus.lng = lng
}

res.send("updated")

})

// SEND BUS DATA
app.get("/bus-data",(req,res)=>{
res.json(buses)
})

app.listen(PORT,()=>{
console.log("Server running on port "+PORT)
})