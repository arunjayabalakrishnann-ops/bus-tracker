let userLat        = null;
let userLng        = null;
let selectedRoute  = null;
let mapInstance    = null;
let busMarker      = null;
let userMarker     = null;
let fetchInterval  = null;
let etaInterval    = null;
let currentEtaMins = 0;

const busIcon = L.icon({
  iconUrl:     '/bus.png',
  iconSize:    [40, 40],
  iconAnchor:  [20, 20],
  popupAnchor: [0, -20]
});

const routeStops = {
  route1: [
    { name: 'Stop A', lat: 11.0168, lng: 76.9558 },
    { name: 'Stop B', lat: 11.0200, lng: 76.9600 },
    { name: 'Stop C', lat: 11.0250, lng: 76.9650 }
  ],
  route2: [
    { name: 'Stop X', lat: 11.0300, lng: 76.9700 },
    { name: 'Stop Y', lat: 11.0350, lng: 76.9750 },
    { name: 'Stop Z', lat: 11.0400, lng: 76.9800 }
  ]
};

function getLocation() {
  const btn = document.getElementById('btn-location');
  btn.textContent = '⏳ Getting your location...';
  btn.disabled = true;

  navigator.geolocation.getCurrentPosition(
    function(position) {
      userLat = position.coords.latitude;
      userLng = position.coords.longitude;
      document.getElementById('step1').innerHTML = `
        <div class='step-tag'>Step 1 — Done ✅</div>
        <h2>📍 Location Found!</h2>
        <p style='color:#00BFA5;margin:0'>GPS captured. Now select your route.</p>`;
      showCard('step2');
    },
    function() {
      btn.textContent = 'Allow Location Access';
      btn.disabled = false;
      alert('Location error. Please allow GPS and try again.');
    }
  );
}

function onRouteSelected() {
  selectedRoute = document.getElementById('route-select').value;
  if (!selectedRoute) return;

  const stops      = routeStops[selectedRoute];
  const destSelect = document.getElementById('dest-select');
  destSelect.innerHTML = '<option value="">-- Select Your Stop --</option>';
  stops.forEach(function(stop, index) {
    const opt       = document.createElement('option');
    opt.value       = index;
    opt.textContent = stop.name;
    destSelect.appendChild(opt);
  });
  showCard('step3');
}

function onDestinationSelected() {
  if (document.getElementById('dest-select').value === '') return;
  showCard('step4');
  if (fetchInterval) clearInterval(fetchInterval);
  fetchBuses();
  fetchInterval = setInterval(fetchBuses, 3000);
}

function fetchBuses() {
  fetch('/buses')
    .then(res => res.json())
    .then(function(buses) {
      if (!buses || Object.keys(buses).length === 0) { showNoBus(); return; }

      let nearestBus  = null;
      let nearestDist = Infinity;
      let nearestId   = null;

      Object.entries(buses).forEach(function([busId, busData]) {
        if (busData.route !== selectedRoute) return;
        const dist = calcDistanceKm(userLat, userLng, busData.lat, busData.lng);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestBus  = busData;
          nearestId   = busId;
        }
      });

      nearestBus ? showBusInfo(nearestId, nearestBus, nearestDist) : showNoBus();
    })
    .catch(() => showNoBus());
}

function showNoBus() {
  document.getElementById('bus-info-container').innerHTML =
    '<p style="color:#FF5722;text-align:center;padding:20px">No buses active on this route right now.<br>Ask the driver to open the Driver page.</p>';
}

function showBusInfo(busId, busData, distKm) {
  const distMetres = Math.round(distKm * 1000);
  const distText   = distMetres < 1000 ? distMetres + ' m' : distKm.toFixed(1) + ' km';
  currentEtaMins   = Math.max(1, Math.round((distKm / 20) * 60));
  const crowdClass = 'crowd-' + (busData.crowd || 'Low');

  document.getElementById('bus-info-container').innerHTML = `
    <div class='bus-id-row'>
      🚌 Bus: <strong style='color:white'>${busId}</strong>
      &nbsp;|&nbsp; Route: <strong style='color:white'>${busData.route}</strong>
    </div>
    <div class='bus-grid'>
      <div class='bus-stat'>
        <span class='val'>${distText}</span>
        <span class='lbl'>Distance</span>
      </div>
      <div class='bus-stat'>
        <span class='val' id='eta-display'>~${currentEtaMins} min</span>
        <span class='lbl'>Arrival (live)</span>
      </div>
      <div class='bus-stat'>
        <span class='val ${crowdClass}'>${busData.crowd || 'Low'}</span>
        <span class='lbl'>Crowd</span>
      </div>
      <div class='bus-stat'>
        <span class='val' style='color:#00BFA5;font-size:0.9rem'>● Live</span>
        <span class='lbl'>Tracking</span>
      </div>
    </div>`;

  if (etaInterval) clearInterval(etaInterval);
  etaInterval = setInterval(function() {
    if (currentEtaMins > 1) {
      currentEtaMins--;
      const etaEl = document.getElementById('eta-display');
      if (etaEl) etaEl.textContent = '~' + currentEtaMins + ' min';
    }
  }, 60000);

  updateMap(busData.lat, busData.lng);
}

function updateMap(busLat, busLng) {
  if (!mapInstance) {
    mapInstance = L.map('map').setView([userLat, userLng], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap', maxZoom: 18
    }).addTo(mapInstance);

    userMarker = L.marker([userLat, userLng], {
      icon: L.divIcon({
        className: '',
        html: '<div style="background:#2979FF;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 0 0 4px rgba(41,121,255,0.3)"></div>',
        iconSize: [16, 16], iconAnchor: [8, 8]
      })
    }).addTo(mapInstance).bindPopup('<b>📍 You are here</b>').openPopup();

    const stops = routeStops[selectedRoute];
    if (stops && stops.length >= 2) {
      L.polyline(stops.map(s => [s.lat, s.lng]), {
        color: '#FF5722', weight: 4, opacity: 0.7, dashArray: '8,6'
      }).addTo(mapInstance);
      stops.forEach(function(stop) {
        L.circleMarker([stop.lat, stop.lng], {
          radius: 5, color: '#FF5722',
          fillColor: 'white', fillOpacity: 1, weight: 2
        }).addTo(mapInstance).bindPopup('🚏 ' + stop.name);
      });
    }
  }

  if (busMarker) {
    busMarker.setLatLng([busLat, busLng]);
  } else {
    busMarker = L.marker([busLat, busLng], { icon: busIcon })
      .addTo(mapInstance)
      .bindPopup('<b>🚌 Bus is here</b>');
  }

  try {
    mapInstance.fitBounds(
      L.featureGroup([userMarker, busMarker]).getBounds().pad(0.3)
    );
  } catch(e) {}
}

function calcDistanceKm(lat1, lng1, lat2, lng2) {
  const R    = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a    = Math.sin(dLat/2)*Math.sin(dLat/2) +
               Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*
               Math.sin(dLng/2)*Math.sin(dLng/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function showCard(id) {
  const el = document.getElementById(id);
  el.classList.remove('hidden');
  setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
}

function resetApp() {
  if (fetchInterval) { clearInterval(fetchInterval); fetchInterval = null; }
  if (etaInterval)   { clearInterval(etaInterval);   etaInterval = null; }
  if (mapInstance)   { mapInstance.remove(); mapInstance = null; busMarker = null; userMarker = null; }
  document.getElementById('step3').classList.add('hidden');
  document.getElementById('step4').classList.add('hidden');
  document.getElementById('route-select').value = '';
  document.getElementById('dest-select').innerHTML = '<option value="">-- Select Your Stop --</option>';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}