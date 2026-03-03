// ─── server.js ──────────────────────────────────────────────────
// This is your Node.js server. It serves your website files and
// handles communication between the browser and your backend.
 
// Load environment variables from .env file
require('dotenv').config();
 
// Import required packages
const express = require('express');
const cors    = require('cors');
const path    = require('path');
 
// Create the Express app
const app  = express();
const PORT = process.env.PORT || 3000;
 
// Allow cross-origin requests (needed for browser-to-server communication)
app.use(cors());
 
// Allow the server to read JSON data
app.use(express.json());
// ── SERVE WEBSITE FILES ─────────────────────────────────────────
// When someone goes to http://localhost:3000
// the server sends files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));
 
// When someone goes to http://localhost:3000/admin/...
// the server sends files from the 'admin' folder
app.use('/admin', express.static(path.join(__dirname, 'admin')));
 
// ── TEST ROUTE ──────────────────────────────────────────────────
// Visit http://localhost:3000/ping to confirm server is running
app.get('/ping', (req, res) => {
  res.json({ status: 'ok', message: 'Bus Tracker server is running!' });
});
 
// ── START SERVER ────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('══════════════════════════════════════════════');
  console.log('🚌  Bus Tracker Server Started!');
  console.log('──────────────────────────────────────────────');
  console.log('📱  Commuter App : http://localhost:' + PORT);
  console.log('🚍  Driver Panel : http://localhost:' + PORT + '/admin/driver.html');
  console.log('🔧  Server Test  : http://localhost:' + PORT + '/ping');
  console.log('══════════════════════════════════════════════');
  console.log('');
});
 
