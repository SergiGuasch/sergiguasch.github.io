// Sample locations in Doha:
//const origin = { lat: 25.31644, lng: 51.48708 };
//const destination = { lat: 25.26743, lng: 51.52502 };

const apiKey = 'yPMFk-Bg30LOe8Msg8G0NxNTbgG2urzgfTjJcFZghYs'; // Replace with your actual HERE API key
import { decode } from "./datos/flexible_polyline.js";

const buttonAd = document.getElementById("getRoute");

let routeLayer;
let arrow;
let startMarker;
let endMarker;


function formatDuration(durationSeconds) {
    const days = Math.floor(durationSeconds / (3600 * 24));
    const hours = Math.floor((durationSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((durationSeconds % 3600) / 60);
    const seconds = Math.round(durationSeconds % 60);

    if (days > 0) {
        return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    } else if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
    } else {
        return `${seconds}s`;
    }
}


function calculateDistance(polyline) {
    let distance = 0;

    for (let i = 1; i < polyline.length; i++) {
        const lat1 = polyline[i - 1][0];
        const lon1 = polyline[i - 1][1];
        const lat2 = polyline[i][0];
        const lon2 = polyline[i][1];

        const R = 6371e3; // Earth radius in meters
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        distance += R * c;
    }

    return distance;
}


function formatDistance(distanceMeters) {
    const kilometers = distanceMeters / 1000;
    return `${kilometers.toFixed(2)} km`;
}

async function getRouteDetails(originLat, originLng, destLat, destLng, transport) {

    // Construct the URL for routing API with the provided coordinates and API key
    const routingURL = `https://router.hereapi.com/v8/routes?transportMode=${transport}&origin=${originLat},${originLng}&destination=${destLat},${destLng}&return=polyline&apiKey=${apiKey}`;

    // Fetch route information using the constructed URL
    const response = await fetch(routingURL);

    // Parse the response data as JSON
    const data = await response.json();

    // Check if there is at least one route in the response
    const route = data.routes?.[0];
    if (!route) {
        throw new Error('No routes found');
    }

    if (routeLayer) {
        mymap.removeLayer(routeLayer);
        mymap.removeLayer(arrow);
        mymap.removeLayer(startMarker);
        mymap.removeLayer(endMarker);
    }

    // Extract departure, arrival, and polyline details from the first route's section
    const section = route.sections[0];
    departure = section.departure.place.location;
    arrival = section.arrival.place.location;
    polyline = section.polyline;
    
    // Parse route geometry

    const decodedRoute = decode(polyline);

    // Calculate duration based on start and end times
    const startTime = new Date(section.departure.time);
    const endTime = new Date(section.arrival.time);
    const durationSeconds = (endTime - startTime) / 1000; // Convert milliseconds to seconds
    const formattedDuration = formatDuration(durationSeconds);

    // Calculate distance
    const distanceMeters = calculateDistance(decodedRoute.polyline);
    const formattedDistance = formatDistance(distanceMeters);

    // Extracting coordinates from the decoded route
    const coordinates = decodedRoute.polyline.map(point => [point[0], point[1]]);

    // Creating a Leaflet polyline from the coordinates
    routeLayer = L.polyline(coordinates, { color: 'blue' }).addTo(mymap);

    // Add directional arrows along the polyline
    arrow = L.polylineDecorator(routeLayer, {
        patterns: [
            { offset: '20%', repeat: 0, symbol: L.Symbol.arrowHead({ pixelSize: 15, polygon: true, pathOptions: { color: 'blue', fillOpacity: 1, weight: 2 } }) },
            { offset: '40%', repeat: 0, symbol: L.Symbol.arrowHead({ pixelSize: 15, polygon: true, pathOptions: { color: 'blue', fillOpacity: 1, weight: 2 } }) },
            { offset: '60%', repeat: 0, symbol: L.Symbol.arrowHead({ pixelSize: 15, polygon: true, pathOptions: { color: 'blue', fillOpacity: 1, weight: 2 } }) },
            { offset: '80%', repeat: 0, symbol: L.Symbol.arrowHead({ pixelSize: 15, polygon: true, pathOptions: { color: 'blue', fillOpacity: 1, weight: 2 } }) }
    ]
    }).addTo(mymap);

    startMarker  = L.marker([departure.lat, departure.lng], {
        icon: L.icon({
            iconUrl: './datos/icons/start.png',
            iconSize: [32, 32], // Adjust the size as needed
            zIndexOffset: 1000
        })
    }).addTo(mymap);

    endMarker  = L.marker([arrival.lat, arrival.lng], {
        icon: L.icon({
            iconUrl: './datos/icons/finish.png',
            iconSize: [32, 32], // Adjust the size as needed
            zIndexOffset: 1000
        })
    }).addTo(mymap);

        
    mymap.fitBounds(routeLayer.getBounds());

    
    return { duration: formattedDuration, distance: formattedDistance  };

}

let departure; 
let arrival;
let polyline;



buttonAd.addEventListener("click", async () => {
    const originLat = parseFloat(document.getElementById("lat_input").value);
    const originLng = parseFloat(document.getElementById("lng_input").value);
    const destLat = parseFloat(document.getElementById("lat_input_dest").value);
    const destLng = parseFloat(document.getElementById("lng_input_dest").value);
    const transport = document.getElementById("select").value;

    try {
        // Call getRouteDetails to fetch route information
        const { duration, distance } = await getRouteDetails(originLat, originLng, destLat, destLng, transport);

        // Display duration and distance on the HTML page
        document.getElementById("duration").textContent = `Duration: ${duration}`;
        document.getElementById("distance").textContent = `Distance: ${distance}`;
    } catch (error) {
        console.error("Error fetching route:", error);
        document.getElementById("duration").textContent = "Route not found";
        document.getElementById("distance").textContent = "";
    }
});


// Leaflet map initialization
var mymap = L.map('mapid').setView([25.276987, 51.520067], 13);

var satelite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

var topo = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles © Esri — Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
});

const style = 'normal.day';

/*
normal.day
normal.day.grey
normal.day.transit
reduced.day
normal.night
reduced.night
pedestrian.day
*/

var HEREmap = L.tileLayer(`https://2.base.maps.ls.hereapi.com/maptile/2.1/maptile/newest/${style}/{z}/{x}/{y}/512/png8?apiKey=${apiKey}&ppi=320`,{
    attribution: '&copy; HERE 2019'}).addTo(mymap);

var baseMaps = {
    "HERE": HEREmap,
    "Satelite": satelite,
    "Topo": topo
};

L.control.layers(baseMaps).addTo(mymap);

L.control.scale({
    position: 'bottomleft',
    imperial: false
}).addTo(mymap);

mymap.addControl(new L.Control.LinearMeasurement({
    unitSystem: 'metric',
    color: '#FF0080',
    type: 'line'
}));

L.control.fullscreen({
    position: 'topleft',
    title: 'Fullscreen',
    titleCancel: 'Exit fullscreen mode',
    content: null,
    forceSeparateButton: true,
    forcePseudoFullscreen: false,
    fullscreenElement: false
}).addTo(mymap);

L.geolet({ position: 'topright' }).addTo(mymap);

var carto_light = new L.TileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}.png', {
    attribution: '©OpenStreetMap, ©CartoDB',
    subdomains: 'abcd',
    maxZoom: 24
});
var minimap = new L.Control.MiniMap(carto_light, {
    toggleDisplay: true,
    minimized: false,
    position: "bottomleft"
}).addTo(mymap);

let selectingInitialCoordinates = true; // Flag to indicate whether initial coordinates are being selected

// Add a click listener to the map
mymap.on('click', function(e) {
    // Check if selecting initial coordinates
    if (selectingInitialCoordinates) {
        // Update the initial coordinates input fields
        document.getElementById("lat_input").value = e.latlng.lat;
        document.getElementById("lng_input").value = e.latlng.lng;
    // Update the flag to indicate end coordinates will be selected next
    selectingInitialCoordinates = false;
    } else {
        // Update the end coordinates input fields
        document.getElementById("lat_input_dest").value = e.latlng.lat;
        document.getElementById("lng_input_dest").value = e.latlng.lng;

        // Reset the flag to indicate initial coordinates will be selected next
        selectingInitialCoordinates = true;
    }
});


function searchAddress(address) {
    // Encode the address for the API request
    var encodedAddress = encodeURIComponent(address);

    // Make a GET request to the HERE Geocoding API
    $.get(`https://geocode.search.hereapi.com/v1/geocode?q=${encodedAddress}&apiKey=${apiKey}`)
        .done(function (data) {
            // Clear existing markers and popups from the map
            mymap.eachLayer(function (layer) {
                if (layer instanceof L.Marker) {
                    mymap.removeLayer(layer);
                }
            });

            // Check if results are returned
            if (data.items.length > 0) {
                // Extract the coordinates of the first result
                var location = data.items[0].position;

                // Center the map on the searched location
                mymap.setView([location.lat, location.lng], 13);

                // Add a marker at the searched location
                L.marker([location.lat, location.lng]).addTo(mymap)
                    .bindPopup(`<b>${address}</b>`).openPopup();
            } else {
                // No results found
                alert('No results found for the entered address.');
            }
        })
        .fail(function () {
            // Error handling
            alert('Error fetching address data. Please try again later.');
        });
}

// Create a search control
var searchControl = L.Control.extend({
    onAdd: function(map) {
        var container = L.DomUtil.create('div', 'leaflet-search-container leaflet-bar');
        container.innerHTML = '<input id="search-input" type="text" placeholder="Search address">' +
                              '<button id="search-button" type="button">Search</button>';

        // Prevent propagation of mouse events within the container
        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.disableScrollPropagation(container);

        // Event listener for the search button click
        container.querySelector('#search-button').addEventListener('click', function (event) {
            // Prevent propagation of mouse events from the button
            L.DomEvent.stopPropagation(event);

            // Get the value from the search input
            var address = container.querySelector('#search-input').value.trim();

            // Check if the address input is empty
            if (address === '') {
                // Clear existing markers and popups from the map
                mymap.eachLayer(function (layer) {
                    if (layer instanceof L.Marker) {
                        mymap.removeLayer(layer);
                    }
                });
                return;
            }

            // Call the searchAddress function with the entered address
            searchAddress(address);
        });

        // Event listener for the Enter key press in the input field
        container.querySelector('#search-input').addEventListener('keypress', function (event) {
            if (event.key === 'Enter') {
                // Prevent the default action of form submission
                event.preventDefault();

                // Get the value from the search input
                var address = container.querySelector('#search-input').value.trim();

                // Check if the address input is empty
                if (address === '') {
                    // Clear existing markers and popups from the map
                    mymap.eachLayer(function (layer) {
                        if (layer instanceof L.Marker) {
                            mymap.removeLayer(layer);
                        }
                    });
                    return;
                }

                // Call the searchAddress function with the entered address
                searchAddress(address);
            }
        });

        return container;
    }
});

// Add the search control to the map
new searchControl().addTo(mymap);