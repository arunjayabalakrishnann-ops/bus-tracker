function startTracking() {
  if (!navigator.geolocation) {
    document.getElementById('status').textContent = '❌ GPS not supported.';
    return;
  }

  document.getElementById('status').textContent = '⏳ Getting GPS...';

  navigator.geolocation.watchPosition(
    function(pos) {
      const lat   = pos.coords.latitude;
      const lng   = pos.coords.longitude;
      const busId = document.getElementById('busId').value;
      const route = document.getElementById('routeId').value;
      const crowd = document.getElementById('crowd').value;

      fetch('/update-bus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: busId, lat, lng, route, crowd })
      })
      .then(() => {
        document.getElementById('status').textContent =
          '✅ Live — Lat: ' + lat.toFixed(5) + ', Lng: ' + lng.toFixed(5);
      })
      .catch(() => {
        document.getElementById('status').textContent = '❌ Failed to send location.';
      });
    },
    function(error) {
      document.getElementById('status').textContent = '❌ GPS error: ' + error.message;
    },
    { enableHighAccuracy: true }
  );
}
