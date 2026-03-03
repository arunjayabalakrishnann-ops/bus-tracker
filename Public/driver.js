// ─── driver.js — GPS Tracking Logic ─────────────────────────────
 
let trackingInterval = null;  // Stores the interval so we can stop it
 
// Called when driver clicks 'Start GPS Tracking'
function startTracking() {
  const busId   = document.getElementById('sel-bus').value;
  const routeId = document.getElementById('sel-route').value;
 
  // Update UI
  document.getElementById('st-status').innerHTML = '<span class="active-badge">● ACTIVE</span>';
  document.getElementById('st-bus').textContent  = busId;
  document.getElementById('btn-stop').disabled   = false;
 
  // Send GPS every 5000 ms (5 seconds)
  trackingInterval = setInterval(function() {
 
    navigator.geolocation.getCurrentPosition(
 
      // Success — got GPS fix
      function(pos) {
        const lat   = pos.coords.latitude;
        const lng   = pos.coords.longitude;
        const crowd = document.getElementById('sel-crowd').value;
        const time  = new Date().toISOString();
 
        // Write to Firebase
        db.ref('buses/' + busId).update({
          route:       routeId,
          lat:         lat,
          lng:         lng,
          crowd:       crowd,
          lastUpdated: time
        });
 
        // Update status display
        document.getElementById('st-lat').textContent  = lat.toFixed(6);
        document.getElementById('st-lng').textContent  = lng.toFixed(6);
        document.getElementById('st-time').textContent = new Date().toLocaleTimeString();
      },
 
      // Error — GPS failed
      function(err) {
        document.getElementById('st-status').textContent = '❌ GPS Error: ' + err.message;
      },
 
      // GPS options — high accuracy
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
 
  }, 5000);  // repeat every 5 seconds
}
 
// Called when driver clicks 'Stop Tracking'
function stopTracking() {
  if (trackingInterval) {
    clearInterval(trackingInterval);
    trackingInterval = null;
  }
  document.getElementById('st-status').textContent = 'Stopped';
  document.getElementById('btn-stop').disabled     = true;
}
 
 
