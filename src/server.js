const express = require("express");
const path    = require("path");
const app     = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "./public")));

const buses = {};

app.post("/update-bus", (req, res) => {
  const { id, lat, lng, route, crowd } = req.body;
  if (!id || !lat || !lng) return res.status(400).json({ error: "Missing data" });
  buses[id] = { lat, lng, route, crowd, updatedAt: Date.now() };
  res.json({ ok: true });
});

app.get("/buses", (req, res) => {
  res.json(buses);
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./public/index.html"));
});

app.get("/driver", (req, res) => {
  res.sendFile(path.join(__dirname, "./public/driver.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));