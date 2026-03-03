require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve public folder
app.use(express.static(path.join(__dirname, 'public')));

// Explicit root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve admin folder
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// Test route
app.get('/ping', (req, res) => {
  res.json({ status: 'ok', message: 'Bus Tracker server is running!' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('Bus Tracker Server Started!');
});
