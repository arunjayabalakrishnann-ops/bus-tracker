// ── app.js — Bus Tracker Commuter App ──────────────────────────
 
// ── Global Variables ────────────────────────────────────────────
let userLat          = null;
let userLng          = null;
let selectedRoute    = null;
let mapInstance      = null;
let busMarker        = null;
let userMarker       = null;
let routeLine        = null;   // the blue route path on map
let realtimeListener = null;
let etaInterval      = null;   // countdown timer for ETA
let currentEtaMins   = 0;      // stores current ETA
let routeStopsData   = [];     // stores stops for the selected route
 
// ════════════════════════════════════════════════════════════════
//  STEP 1 — GET USER GPS LOCATION
// ════════════════════════════════════════════════════════════════
function getLocation() {
  const btn = document.getElementById('btn-location');
  btn.textContent = '⏳ Getting your location...';
  btn.disabled = true;
 
  if (!navigator.geolocation) {
    alert('Please use Google Chrome browser for GPS to work.');
    btn.textContent = 'Allow Location Access';
    btn.disabled = false;
    return;
  }
 
  navigator.geolocation.getCurrentPosition(
    function(position) {
      userLat = position.coords.latitude;
      userLng = position.coords.longitude;
 
      document.getElementById('step1').innerHTML = `
        <div class='step-tag'>Step 1 — Done ✅</div>
        <h2>📍 Location Found!</h2>
        <p style='color:#00BFA5; margin:0'>GPS captured. Now select your bus route.</p>`,
      showCard('step2');
      loadRoutes();
    },
    function(error) {
      btn.textContent = 'Allow Location Access';
      btn.disabled = false;
      if (error.code === 1)
        alert('Location blocked. Click the lock icon in the browser address bar → Allow Location → Refresh.');
      else if (error.code === 2)
        alert('GPS not available. Make sure location is ON on your device.');
      else
        alert('Location error. Please try again.');
    }
  );
}
 
// ════════════════════════════════════════════════════════════════
//  STEP 2 — LOAD ROUTES FROM FIREBASE
// ════════════════════════════════════════════════════════════════
function loadRoutes() {
  const select = document.getElementById('route-select');
  select.innerHTML = '<option value="">⏳ Loading routes...</option>';
 
  // Read routes from Firebase
  db.ref('routes').once('value')
    .then(function(snapshot) {
      const data = snapshot.val();
 
      // ── DEBUG: log to console so you can see what Firebase returned
      console.log('Firebase routes data:', data);
 
      if (!data) {
        select.innerHTML = '<option value="">❌ No routes found in Firebase</option>';
        alert('No routes found. Please add route data to Firebase first.');
        return;
      }
 
      // Clear loading message
      select.innerHTML = '<option value="">-- Choose a Route --</option>';
 
      // Add each route as a dropdown option
      Object.keys(data).forEach(function(key) {
        const option       = document.createElement('option');
        option.value       = key;
        option.textContent = data[key].name || key;
        select.appendChild(option);
        console.log('Added route:', key, data[key].name);
      });
    })
    .catch(function(error) {
      console.error('Firebase error:', error);
      select.innerHTML = '<option value="">❌ Firebase connection error</option>';
      alert('Firebase error: ' + error.message + '\nCheck your firebase-config.js keys.');
    });
}
 
// Called when user picks a route
function onRouteSelected() {
  const routeKey = document.getElementById('route-select').value;
  if (!routeKey) return;
  selectedRoute = routeKey;
 
  db.ref('routes/' + routeKey + '/stops').once('value')
    .then(function(snap) {
      const stops = snap.val();
      console.log('Stops loaded:', stops);
 
      if (!stops) {
        alert('No stops found for this route in Firebase.');
        return;
      }
 
      // Save stops globally for map route line
      routeStopsData = Array.isArray(stops) ? stops : Object.values(stops);
 
      const destSelect = document.getElementById('dest-select');
      destSelect.innerHTML = '<option value="">-- Select Your Stop --</option>';
 
      routeStopsData.forEach(function(stop, index) {
        const opt       = document.createElement('option');
        opt.value       = index;
        opt.textContent = stop.name;
        destSelect.appendChild(opt);
      });
 
      showCard('step3');
    })
    .catch(function(err) {
      console.error('Stops error:', err);
      alert('Error loading stops: ' + err.message);
    });
}
 
// ════════════════════════════════════════════════════════════════
//  STEP 3 — DESTINATION SELECTED
// ════════════════════════════════════════════════════════════════
function onDestinationSelected() {
  const destIndex = document.getElementById('dest-select').value;
  if (destIndex === '') return;
 
  showCard('step4');
 
  // Stop any old listener
  if (realtimeListener) {
    db.ref('buses').off('value', realtimeListener);
    realtimeListener = null;
  }
 
  // Stop old ETA countdown
  if (etaInterval) { clearInterval(etaInterval); etaInterval = null; }
 
  // Start real-time listener — runs every time ANY bus updates in Firebase
  realtimeListener = db.ref('buses').on('value', function(snapshot) {
    const allBuses = snapshot.val();
    console.log('Bus data updated:', allBuses);
    findAndShowNearestBus(allBuses);
  });
}
 
// ════════════════════════════════════════════════════════════════
//  FIND NEAREST BUS
// ════════════════════════════════════════════════════════════════
function findAndShowNearestBus(allBuses) {
  if (!allBuses) {
    showNoBus(); return;
  }
 
  let nearestBus  = null;
  let nearestDist = Infinity;
  let nearestId   = null;
 
  Object.entries(allBuses).forEach(function([busId, busData]) {
    // Only show buses on the selected route
    if (busData.route !== selectedRoute) return;
 
    const dist = calcDistanceKm(userLat, userLng, busData.lat, busData.lng);
    if (dist < nearestDist) {
      nearestDist = dist;
      nearestBus  = busData;
      nearestId   = busId;
    }
  });
 
  if (nearestBus) {
    showBusInfo(nearestId, nearestBus, nearestDist);
  } else {
    showNoBus();
  }
}
 
function showNoBus() {
  document.getElementById('bus-info-container').innerHTML =
    '<p style="color:#FF5722;text-align:center;padding:20px">No buses active on this route right now.<br>Ask your friend to open the Driver page and start tracking.</p>';
}
 
// ════════════════════════════════════════════════════════════════
//  SHOW BUS INFO CARD + START ETA COUNTDOWN
// ════════════════════════════════════════════════════════════════
function showBusInfo(busId, busData, distKm) {
  const distMetres = Math.round(distKm * 1000);
  const distText   = distMetres < 1000 ? distMetres + ' m' : distKm.toFixed(1) + ' km';
 
  // Calculate ETA — average city bus speed 20 km/h
  currentEtaMins = Math.max(1, Math.round((distKm / 20) * 60));
 
  const crowdClass = 'crowd-' + (busData.crowd || 'Low');
 
  // Render bus info card
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
    </div>`,
 
  // ── START ETA COUNTDOWN ──────────────────────────────────────
  // Reduce ETA by 1 every minute — this makes it count down visually
  if (etaInterval) clearInterval(etaInterval);
  etaInterval = setInterval(function() {
    if (currentEtaMins > 1) {
      currentEtaMins--;
      const etaEl = document.getElementById('eta-display');
      if (etaEl) etaEl.textContent = '~' + currentEtaMins + ' min';
    }
  }, 60000); // every 60 seconds
 
  // Update map
  updateMap(busData.lat, busData.lng);
}
 
// ════════════════════════════════════════════════════════════════
//  MAP — Show route line + bus pin + user pin
// ════════════════════════════════════════════════════════════════
function updateMap(busLat, busLng) {
  if (!mapInstance) {
    // Create map
    mapInstance = L.map('map').setView([userLat, userLng], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap', maxZoom: 18
    }).addTo(mapInstance);
 
    // Add user pin — blue
    userMarker = L.marker([userLat, userLng], {
      icon: L.divIcon({
        className: '',
        html: '<div style="background:#2979FF;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 0 0 4px rgba(41,121,255,0.3)"></div>',
        iconSize: [16,16], iconAnchor: [8,8]
      })
    }).addTo(mapInstance).bindPopup('<b>📍 You are here</b>').openPopup();
 
    // Draw route line on the map using stop coordinates
    if (routeStopsData.length >= 2) {
      const latlngs = routeStopsData.map(s => [s.lat, s.lng]);
      routeLine = L.polyline(latlngs, {
        color: '#FF5722',
        weight: 4,
        opacity: 0.7,
        dashArray: '8, 6'
      }).addTo(mapInstance);
 
      // Add a small circle for each bus stop
      routeStopsData.forEach(function(stop) {
        L.circleMarker([stop.lat, stop.lng], {
          radius: 5, color: '#FF5722',
          fillColor: 'white', fillOpacity: 1, weight: 2
        }).addTo(mapInstance).bindPopup('🚏 ' + stop.name);
      });
    }
  }
 
  // Add or move the bus pin
  if (busMarker) {
    // Smoothly animate the bus pin moving to new position
    busMarker.setLatLng([busLat, busLng]);
  } else {
    busMarker = L.marker([busLat, busLng], {
      icon: L.divIcon({
        className: '',
        html: '<div style="background:#FF5722;width:36px;height:36px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 4px 12px rgba(255,87,34,0.5)"><span style="transform:rotate(45deg);display:block;text-align:center;line-height:30px;font-size:16px">🚌</span></div>',
        iconSize: [36,36], iconAnchor: [18,36]
      })
    }).addTo(mapInstance).bindPopup('<b>🚌 Bus is here</b>');
  }
 
  // Zoom map to show both user and bus
  try {
    const group = L.featureGroup([userMarker, busMarker]);
    mapInstance.fitBounds(group.getBounds().pad(0.3));
  } catch(e) {}
}
 
// ════════════════════════════════════════════════════════════════
//  HAVERSINE DISTANCE FORMULA
// ════════════════════════════════════════════════════════════════
function calcDistanceKm(lat1, lng1, lat2, lng2) {
  const R    = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a    = Math.sin(dLat/2)*Math.sin(dLat/2) +
               Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*
               Math.sin(dLng/2)*Math.sin(dLng/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}
 
// ════════════════════════════════════════════════════════════════
//  UTILITY
// ════════════════════════════════════════════════════════════════
function showCard(id) {
  const el = document.getElementById(id);
  el.classList.remove('hidden');
  setTimeout(()=>el.scrollIntoView({behavior:'smooth',block:'start'}),100);
}
 
function resetApp() {
  if (realtimeListener) { db.ref('buses').off('value',realtimeListener); realtimeListener=null; }
  if (etaInterval)      { clearInterval(etaInterval); etaInterval=null; }
  if (mapInstance)      { mapInstance.remove(); mapInstance=null; busMarker=null; userMarker=null; routeLine=null; }
  document.getElementById('step3').classList.add('hidden');
  document.getElementById('step4').classList.add('hidden');
  document.getElementById('route-select').value='';
  document.getElementById('dest-select').innerHTML='<option value="">-- Select Your Stop --</option>';
  routeStopsData=[];
  window.scrollTo({top:0,behavior:'smooth'});
}

