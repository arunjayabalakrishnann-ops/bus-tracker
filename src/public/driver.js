// ── driver.js — Bus Driver Location Sender ──────────────────────

navigator.geolocation.watchPosition(
  function(pos) {
    const lat   = pos.coords.latitude;
    const lng   = pos.coords.longitude;
    const busId = document.getElementById('busId').value;
    const route = document.getElementById('routeId').value;

    db.ref('buses/' + busId).set({
      lat:       lat,
      lng:       lng,
      route:     route,
      crowd:     document.getElementById('crowd').value || 'Low',
      updatedAt: Date.now()
    });

    document.getElementById('status').textContent =
      '✅ Sharing live — Lat: ' + lat.toFixed(5) + ', Lng: ' + lng.toFixed(5);
  },
  function(error) {
    document.getElementById('status').textContent =
      '❌ GPS error: ' + error.message;
  },
  { enableHighAccuracy: true }
);