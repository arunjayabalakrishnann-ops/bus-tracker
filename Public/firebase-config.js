// ─── Firebase Configuration ─────────────────────────────────────
// Replace every line below with your actual Firebase config values
// Get them from: Firebase Console → Project Settings → Your Apps
 
const firebaseConfig = {
  apiKey:            "AIzaSyBPJdkd1-_XF_zabZCYUECAIuiV7OXR0NE",
  authDomain:        "enga-bus.firebaseapp.com",
  databaseURL:       "https://enga-bus-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId:         "enga-bus",
  storageBucket:     "enga-bus.firebasestorage.app",
  messagingSenderId: "410956716196",
  appId:             "1:410956716196:web:075f9120e2cbbb857c2e31"
};

 
// Initialize Firebase with your config
firebase.initializeApp(firebaseConfig);
 
// Create a database reference (used by app.js and driver.js)
const db = firebase.database();
 
console.log('Firebase connected successfully!');
