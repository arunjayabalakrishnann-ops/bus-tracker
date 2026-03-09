let map = L.map('map').setView([13.0827, 80.2707], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
}).addTo(map);

let userMarker;
let busMarker;
let routeLine;

let userLat;
let userLng;

let oldDistance = null;

// Bus icon
let busIcon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/61/61231.png",
    iconSize: [40, 40]
});

// Get commuter location
navigator.geolocation.getCurrentPosition(
(position) => {

    userLat = position.coords.latitude;
    userLng = position.coords.longitude;

    // Add commuter marker
    userMarker = L.marker([userLat, userLng])
        .addTo(map)
        .bindPopup("Your Location")
        .openPopup();

    map.setView([userLat, userLng], 14);

    // Update bus location every 5 seconds
    setInterval(() => {

        fetch("/bus-location")
        .then(res => res.json())
        .then(data => {

            if(!data.lat) return;

            // Remove old bus marker
            if(busMarker){
                map.removeLayer(busMarker);
            }

            // Add bus marker
            busMarker = L.marker([data.lat, data.lng], {icon: busIcon})
                .addTo(map)
                .bindPopup("Bus Location");

            // Draw route line
            if(routeLine){
                map.removeLayer(routeLine);
            }

            routeLine = L.polyline([
                [userLat, userLng],
                [data.lat, data.lng]
            ],{
                color: "blue",
                weight: 4
            }).addTo(map);

            // Calculate distance
            let distance = getDistance(userLat, userLng, data.lat, data.lng);

            let statusText = "Distance: " + distance.toFixed(2) + " km";

            if(oldDistance !== null){

                if(distance < oldDistance){
                    statusText += "<br>Bus is moving towards you";
                }
                else if(distance > oldDistance){
                    statusText += "<br>Bus is moving away from you";
                }

            }

            oldDistance = distance;

            document.getElementById("status").innerHTML = statusText;

        });

    }, 5000);

},
(error) => {
    alert("Location access required for commuter tracking.");
},
{
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0
}
);


// Distance calculation (Haversine formula)
function getDistance(lat1, lon1, lat2, lon2){

    const R = 6371;

    let dLat = (lat2 - lat1) * Math.PI / 180;
    let dLon = (lon2 - lon1) * Math.PI / 180;

    let a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI/180) *
        Math.cos(lat2 * Math.PI/180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);

    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
}