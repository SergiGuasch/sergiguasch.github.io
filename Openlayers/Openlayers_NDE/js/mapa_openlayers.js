//Definimos la variable map que alojará nuestro mapa
var map = new ol.Map({
	target: 'map',
	view: new ol.View({
		center: [312807, 5156486],  /*center: ol.proj.transform([2.81, 41.97], 'EPSG:4326', 'EPSG:3857'),*/
		zoom: 14,
		extent: [304755, 5147647, 323864, 5166756]
	}),
	layers: [
		new ol.layer.Tile({
			source: new ol.source.OSM()
		})
	]
});