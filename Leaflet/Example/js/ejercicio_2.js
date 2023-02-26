//mapa
var map = L.map('map',{
	center: [41.40132, 2.16928], /*var map = L.map('map').setView([41.39742, 2.16328], 13);*/
	zoom: 13
});

/*var locationMap = L.map('location-map',{
	center: [41.38132, 2.16328],
	zoom: 13
});*/

//capas

/*L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(locationMap);*/

var satelite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
}).addTo(map);

var topo = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
attribution: 'Tiles © Esri — Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
});

var historic = L.tileLayer.wms("http://historics.icc.cat/lizardtech/iserv/ows", {
	layers: 'orto5m2000',
	format: 'image/png',
	transparent: true,
	attribution: "Institut Cartogràfic y Geològic de Catalunya"
});

var suelo = L.tileLayer.wms("https://servicios.idee.es/wms-inspire/ocupacion-suelo", {
	layers: 'LU.ExistingLandUse',
	format: 'image/png',
	transparent: true,
	attribution: "IDEE"
});

var transporte = L.tileLayer.wms("https://servicios.idee.es/wms-inspire/transportes", {
	layers: 'TN.RailTransportNetwork.RailwayLink',
	format: 'image/png',
	transparent: true,
	attribution: "IDEE"
});

var turistico = L.geoJSON(atraccion, {
	onEachFeature: function(feature, layer)
		{layer.bindPopup(`Nombre: ${feature.properties.nombre}<br>Descripción: ${feature.properties.descripcion}<br>Tipo: ${feature.properties.tipo}`);
	}
}).addTo(map);

var estiloCirculosRojos = {
	radius: 8,
	fillColor: "#ff0000",
	color: "#000",
	weight: 1,
	opacity: 1,
	fillOpacity: 0.8
};

var quioscos = L.geoJSON(null, {
	pointToLayer: function (feature, latlng) {
		return L.circleMarker(latlng, estiloCirculosRojos);
	},
	onEachFeature: function(feature, layer) {
		layer.bindPopup(`Distrito: ${feature.properties.DISTRICTE}<br>Barrio: ${feature.properties.BARRI}`);
	}
}).addTo(map);

omnivore.kml('datos/quioscos.kml', null, quioscos).addTo(map);

var capaEdicion = new L.FeatureGroup().addTo(map);

map.on('draw:created', function (evento) {
	var layer = evento.layer;
	capaEdicion.addLayer(layer);
});

//controles
L.control.scale({
	position: 'bottomright',
	imperial: false
}).addTo(map);

var baseMaps = {
	"Satelite": satelite,
	"Topo": topo
};

var overlays = {
	"Ortofoto 2000": historic,
	"Ocupación del Suelo": suelo,
	"Red de Transportes": transporte,
	"Atracción turística": turistico,
	"Quioscos": quioscos
};

L.control.layers(baseMaps, overlays).addTo(map);

/*locationMap.on('move', function() {
  map.setView(locationMap.getCenter(), locationMap.getZoom());
});

map.on('move', function() {
  locationMap.setView(map.getCenter(), map.getZoom());
});*/

var carto_light = new L.TileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}.png', {attribution: '©OpenStreetMap, ©CartoDB', subdomains: 'abcd', maxZoom:24});
var minimap = new L.Control.MiniMap(carto_light,
	{
		toggleDisplay: true,
		minimized: false,
		position:"bottomright"
	}).addTo(map);


// create a fullscreen button and add it to the map
L.control.fullscreen({
  position: 'topleft', // change the position of the button can be topleft, topright, bottomright or bottomleft, default topleft
  title: 'Fullscreen', // change the title of the button, default Full Screen
  titleCancel: 'Exit fullscreen mode', // change the title of the button when fullscreen is on, default Exit Full Screen
  content: null, // change the content of the button, can be HTML, default null
  forceSeparateButton: true, // force separate button to detach from zoom buttons, default false
  forcePseudoFullscreen: false, // force use of pseudo full screen even if full screen API is available, default false
  fullscreenElement: false // Dom element to render in full screen, false by default, fallback to map._container
}).addTo(map);


map.addControl(new L.Control.LinearMeasurement({
    unitSystem: 'metric',
    color: '#FF0080',
    type: 'line'
}));


L.control.bigImage({position: 'bottomleft'}).addTo(map);


L.geolet({ position: 'topright' }).addTo(map);


var drawControl = new L.Control.Draw({
	draw: {
			polygon: {
				shapeOptions: {
					color: '#97009c'
							}
					},
			polyline: true,
			marker: true,
			circle: false,
			rectangle: false,
		  },
	edit: {
		featureGroup: capaEdicion
		  }
});

map.addControl(drawControl);   /*var drawControl = new L.Control.Draw().addTo(map);*/

