const express = require("express");
const path = require("path");

const app = express();

app.use(express.json());

// SERVE PUBLIC FOLDER
app.use(express.static(path.join(__dirname, "public")));

let buses = [];

// Home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// Driver page
app.get("/driver.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public/driver.html"));
});

// Update bus GPS
app.post("/update-bus", (req, res) => {

  const { name, lat, lng, crowd } = req.body;

  const existing = buses.find(b => b.name === name);

  if (existing) {

    existing.lat = lat;
    existing.lng = lng;
    existing.crowd = crowd;

  } else {

    buses.push({ name, lat, lng, crowd });

  }

  res.sendStatus(200);

});

// Send bus data
app.get("/bus-data", (req, res) => {
  res.json(buses);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});