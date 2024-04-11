const apiKey = 'yPMFk-Bg30LOe8Msg8G0NxNTbgG2urzgfTjJcFZghYs'; // Replace with your actual HERE API key
// Sample locations in Doha:
//const origin = { lat: 25.31644, lng: 51.48708 };
//const destination = { lat: 25.26743, lng: 51.52502 };

import { decode } from "./datos/flexible_polyline.js";

let routeLayer;
let arrow;
let startMarker;
let endMarker;

async function getRouteDetails(originLat, originLng, destLat, destLng) {
    // Construct the URL for routing API with the provided coordinates and API key
    const routingURL = `https://router.hereapi.com/v8/routes?transportMode=car&origin=${originLat},${originLng}&destination=${destLat},${destLng}&return=polyline&apiKey=${apiKey}`;

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

}

let departure; 
let arrival;
let polyline;


// Add event listener for the button click
document.getElementById("getRoute").addEventListener("click", function () {
    // Get the latitude and longitude values from the input fields
    const originLat = parseFloat(document.getElementById("lat_input").value);
    const originLng = parseFloat(document.getElementById("lng_input").value);
    const destLat = parseFloat(document.getElementById("lat_input_dest").value);
    const destLng = parseFloat(document.getElementById("lng_input_dest").value);

    // Call the getRouteDetails function with the provided coordinates
    getRouteDetails(originLat, originLng, destLat, destLng);
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
