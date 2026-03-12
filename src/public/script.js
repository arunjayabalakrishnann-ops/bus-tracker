const socket = io();

// Create map
const map = L.map('map').setView([11.0168, 76.9558], 18);

// Map tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
}).addTo(map);


// BUS ICON (ONLINE IMAGE — GUARANTEED TO LOAD)
const busIcon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/3448/3448339.png",
    iconSize: [50, 50],
    iconAnchor: [25, 25]
});


let busMarker = null;
let userMarker = null;


// RECEIVE BUS GPS
socket.on("busLocation", (data) => {

    const lat = data.lat;
    const lng = data.lng;
    const crowd = data.crowd;
    const busId = data.busId;

    if (!busMarker) {

        busMarker = L.marker([lat, lng], {
            icon: busIcon
        }).addTo(map);

    }

    busMarker.setLatLng([lat, lng]);

    busMarker.bindPopup(
        "<b>" + busId + "</b><br>" +
        "Crowd Level: " + crowd
    );

});


// USER LOCATION
navigator.geolocation.watchPosition((pos) => {

    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;

    if (!userMarker) {

        userMarker = L.marker([lat, lng])
            .addTo(map)
            .bindPopup("Your Location");

        map.setView([lat, lng], 18);

    } else {

        userMarker.setLatLng([lat, lng]);

    }

}, {
    enableHighAccuracy: true
});