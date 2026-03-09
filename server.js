const express = require("express");
const path = require("path");

const app = express();

// serve static files
app.use(express.static(path.join(__dirname, "public")));

// homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// driver page
app.get("/driver", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "driver.html"));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});