const express = require("express");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static("public"));

let busLocation = { lat: null, lng: null };

app.post("/update-location", (req, res) => {
    const { lat, lng } = req.body;

    busLocation = { lat, lng };

    console.log("Bus Location Updated:", busLocation);

    res.json({ status: "ok" });
});

app.get("/bus-location", (req, res) => {
    res.json(busLocation);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server running on port", PORT);
});