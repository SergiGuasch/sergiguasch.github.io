//Importamos los módulos requeridos
import Map from 'ol/Map.js'
import View from 'ol/View.js'
import TileLayer from 'ol/layer/Tile.js'
import {get as getProjection} from 'ol/proj.js'
import OSM from 'ol/source/OSM.js'
import TileWMS from 'ol/source/TileWMS.js'
import Stamen from 'ol/source/Stamen.js'
import {Group as LayerGroup} from 'ol/layer.js'
import {transform} from 'ol/proj';
import KML from 'ol/format/KML'
import ruta_kml from 'c:/openlayers/Openlayers_DE/datos/quioscos.kml'
import GPX from 'ol/format/GPX';
import ruta_gpx from 'c:/openlayers/Openlayers_DE/datos/Lunch_Run.gpx';
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import {defaults as defaultControls, OverviewMap} from 'ol/control.js'
import FullScreen from 'ol/control/FullScreen';
import MousePosition from 'ol/control/MousePosition';
import {fromLonLat} from 'ol/proj';
import {toStringHDMS} from 'ol/coordinate';
import {createStringXY} from 'ol/coordinate';
import Style from 'ol/style/Style.js'
import Icon from 'ol/style/Icon.js'
import Feature from 'ol/Feature.js';
import kiosko from 'c:/openlayers/Openlayers_DE/images/kiosko.png'
import Fill from 'ol/style/Fill.js';
import Stroke from 'ol/style/Stroke.js';
import {click, pointerMove} from 'ol/events/condition.js';
import Select from 'ol/interaction/Select.js';
import {defaults as defaultInteractions} from 'ol/interaction.js';
import Overlay from 'ol/Overlay.js';
import LayerSwitcher from 'ol-layerswitcher';



const oldCoordinates = [2.16928, 41.40132];
const newCoordinates = transform(oldCoordinates, 'EPSG:4326', 'EPSG:3857'); 

var mylayers = [
	//Capas BaseMap
	new LayerGroup({
		'title': 'Base maps',
		layers: [
			new TileLayer ({
				title: 'Ocupación Suelo', //Título de la capa
				type: 'base',//Tipo de capa
				visible: false,
				source: new TileWMS({
				    url: 'https://servicios.idee.es/wms-inspire/ocupacion-suelo', 
				    params: {'LAYERS': 'LU.ExistingLandUse'}
				})
			}),
			new TileLayer({
				title: 'OSM',//Título de la capa
				type: 'base',//Tipo de capa
				visible: true,
				source: new OSM()
			})
		]
	})
,
	//Capas Overlay
	new LayerGroup({
		title: 'Overlays',
		layers: [
			new TileLayer({
				title:'Ortofoto',//Título de la capa
				type: 'overlays',//Tipo de capa
				opacity:1,
				visible: false,
				source: new TileWMS({
					url: 'http://www.ign.es/wms/pnoa-historico?',
					params: {'LAYERS': 'PNOA2004', 'TILED': true}
				})
			}),
			/*new VectorLayer({
				title:'Quioscos',//Título de la capa
				type: 'overlays',//Tipo de capa
				opacity:1,
				source: new VectorSource({
					url: ruta_kml,
					format: new KML()  			
				}),
				style: new Style({
	    			image: new Icon({
					  size: [50,50],
					  anchor: [24,33],
					  anchorXUnits: 'pixels',
					  anchorYUnits: 'pixels',
				      src: kiosko
					})
  				})
			}),*/
			new VectorLayer({
				title:'Run',//Título de la capa
				type: 'overlays',//Tipo de capa
				opacity:1,
				source: new VectorSource({
					url: ruta_gpx,
					format: new GPX() 			
				}),
				style: new Style({
					//relleno
					/*fill: new Fill({
						color: 'rgba(0, 0, 255, 0.5)',
					}),*/
					//contorno
					stroke: new Stroke({
						color: 'rgba(255, 0, 255, 1.0)', // pink color
						width: 3
					})
				})
			})
		]
	})
]


var kioskoStyle = new Style({
  image: new Icon({
    src: kiosko,  // path to the kiosko icon image
    scale: 1,   // adjust the size of the icon if necessary
  }),
});


var quioscosLayer = new VectorLayer({
	title:'Quioscos',//Título de la capa
	type: 'overlays',//Tipo de capa
	opacity:1,
	source: new VectorSource({
		url: ruta_kml,
		format: new KML()  			
	}),
	style: kioskoStyle
})

var overlayGroup = mylayers.find(layer => layer.get('title') === 'Overlays');
overlayGroup.getLayers().push(quioscosLayer);


//Definimos la interacción tras la capa earthQuakeLayer
var selectInteraction = new Select({
	condition: click,
	//Array de capas de la interacción
	layers: [quioscosLayer]
})


selectInteraction.on('select', function(evento) {
	var coordinate = evento.mapBrowserEvent.coordinate;
	//Una array vacia (length=0) indica que no hay
	//entidades seleccionadas
	var isSelected = evento.selected.length

	//Si se ha seleccionado una entidad
	if (isSelected) {
		var feature = evento.selected[0];
		var content = document.getElementById('popup');
		var info = 'DISTRITO: ' + feature.get('DISTRICTE') + '<br/>BARRIO: ' + feature.get('BARRI');
		popup.setPosition(coordinate);
		content.innerHTML = info;
	}
	//Si se ha des-seleccionado una entidad
	else {
		//Insertamos unas coordenadas undefined para que no aparezca en pantalla
		popup.setPosition(undefined);
	}
});

var popup = new Overlay({
	//indicamos cual es el elemento contenedor
	element: document.getElementById('popup')
});


//Parámetro options
var overviewoptions = {
	//Definimos la clase para asignar un estilo concreto al objeto
	className: 'ol-overviewmap ol-custom-overviewmap',

	//Capas que se mostrarán en el OverviewMap
	//Mantenemos la misma capa del mapa aunque podría ser distinta
	layers: [
		new TileLayer({
			source: new OSM({
			'url': 'http://{a-c}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png'
			})
		})
		],
	//Oculto por defecto
	collapsed: false,

	//ToolTip
	tipLabel: 'Mapa de referencia'
}


//Definimos nuestro mapa
var map = new Map({
	layers: mylayers,
	target: 'map',
	view: new View({
		center: newCoordinates,
		zoom: 13.5
	}),

	interactions: defaultInteractions().extend([selectInteraction]),
	overlays: [popup],

	//Agregamos nuestro control OverviewMap extendiendo los controles por defecto
	controls: defaultControls().extend([
		new OverviewMap(overviewoptions)
	])
})

//Escucha
quioscosLayer.once('change', function(e) {
	//comprobamos el estado
	if (quioscosLayer.getSourceState()=='ready'){
		//recorremos todas las entidades
		quioscosLayer.getSource().forEachFeature(function(feature){
				feature.setStyle(kioskoStyle)
		})
	}
})


//Definimos el control
var layerSwitcher = new LayerSwitcher({
	tipLabel: 'Leyenda'
})

//Agregamos el control al mapa
map.addControl(layerSwitcher)

//Lo mostramos desplegado
layerSwitcher.showPanel()


// Creamos un nuevo control de pantalla completa
var fullScreenControl = new ol.control.FullScreen();

// Agregamos el control al mapa
map.addControl(fullScreenControl);

// Crear una nueva instancia del control MousePosition
var mousePositionControl = new ol.control.MousePosition({
  coordinateFormat: ol.coordinate.createStringXY(4), // formato de las coordenadas
  projection: 'EPSG:4326', // sistema de coordenadas en el que se mostrarán las coordenadas
  className: 'custom-mouse-position', // clase CSS personalizada para el control
  target: document.getElementById('mouse-position'), // elemento HTML donde se mostrarán las coordenadas
  undefinedHTML: '&nbsp;' // HTML a mostrar cuando no se han detectado coordenadas
});

// Agregar el control MousePosition al mapa
map.addControl(mousePositionControl);
