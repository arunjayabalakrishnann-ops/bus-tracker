const busName = prompt("Enter Bus Name (BUS1 or BUS2)");

const crowd = prompt("Crowd level (Low / Medium / High)");

navigator.geolocation.watchPosition(position => {

  const lat = position.coords.latitude;
  const lng = position.coords.longitude;

  fetch("/update-bus", {

    method: "POST",

    headers: {
      "Content-Type": "application/json"
    },

    body: JSON.stringify({
      name: busName,
      lat: lat,
      lng: lng,
      crowd: crowd
    })

  });

}, {

  enableHighAccuracy: true,
  maximumAge: 0,
  timeout: 10000

});