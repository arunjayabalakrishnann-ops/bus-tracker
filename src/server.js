const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// serve public folder
app.use(express.static(path.join(__dirname, "public")));

// routes
app.get("/", (req,res)=>{
res.sendFile(path.join(__dirname,"public","index.html"));
});

app.get("/driver", (req,res)=>{
res.sendFile(path.join(__dirname,"public","driver.html"));
});

// socket connection
io.on("connection",(socket)=>{

socket.on("busLocation",(data)=>{
io.emit("busLocation",data);
});

});

const PORT = process.env.PORT || 3000;

server.listen(PORT,()=>{
console.log("Server running on port "+PORT);
});