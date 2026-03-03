const express = require("express");
const path = require("path");
const app = express();

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, "./public")));

// Homepage route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./public/index.html"));
});

// Driver panel route
app.get("/driver", (req, res) => {
  res.sendFile(path.join(__dirname, "./public/driver.html"));
});

// Optional: other routes if you add more HTML pages
// app.get("/commuter", (req, res) => {
//   res.sendFile(path.join(__dirname, "./public/commuter.html"));
// });

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});