//const auth_user = 'https://www.strava.com/oauth/authorize?client_id=102719&redirect_uri=http://localhost&response_type=code&scope=activity:read';
// the above link is how end user authroizes. This will be done once manually then we will use token/refresh token
const auth_link = 'https://www.strava.com/oauth/token';
// above link used for getting token and refreshing token
//const activites_link = 'https://www.strava.com/api/v3/athlete/activities?access_token=xxxx'
// above link used for getting activites 

function getActivities(code, page){

    const perPage = 200;
    const activities_link = `https://www.strava.com/api/v3/athlete/activities?access_token=${code.access_token}&per_page=200`
    console.log(code)
    fetch(activities_link)
        .then(res => res.json())
        .then(function (data){

            var mymap = L.map('mapid').setView([42.00132, 1.96928], 7.5);

            var satelite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            }).addTo(mymap);

            var topo = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles © Esri — Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
            });

            var baseMaps = {
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
            position: 'topleft', // change the position of the button can be topleft, topright, bottomright or bottomleft, default topleft
            title: 'Fullscreen', // change the title of the button, default Full Screen
            titleCancel: 'Exit fullscreen mode', // change the title of the button when fullscreen is on, default Exit Full Screen
            content: null, // change the content of the button, can be HTML, default null
            forceSeparateButton: true, // force separate button to detach from zoom buttons, default false
            forcePseudoFullscreen: false, // force use of pseudo full screen even if full screen API is available, default false
            fullscreenElement: false // Dom element to render in full screen, false by default, fallback to map._container
            }).addTo(mymap);

            L.geolet({ position: 'topright' }).addTo(mymap);

            var carto_light = new L.TileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}.png', {attribution: '©OpenStreetMap, ©CartoDB', subdomains: 'abcd', maxZoom:24});
            var minimap = new L.Control.MiniMap(carto_light,
              {
                toggleDisplay: true,
                minimized: false,
                position:"bottomleft"
              }).addTo(mymap);

            var legend = L.control({ position: 'bottomright' });
            legend.onAdd = function (map) {
                var div = L.DomUtil.create('div', 'legend');
                div.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
                div.style.padding = '10px';
                div.innerHTML += '<b>ACTIVITY TYPES</b><br>';
                div.innerHTML += '<i style="background:red; display:inline-block; width:10px; height:10px; margin-right:5px;"></i><span>Hike</span><br>';
                div.innerHTML += '<i style="background:violet; display:inline-block; width:10px; height:10px; margin-right:5px;"></i><span>Ride</span><br>';
                div.innerHTML += '<i style="background:orange; display:inline-block; width:10px; height:10px; margin-right:5px;"></i><span>Run</span><br>';
                div.innerHTML += '<i style="background:blue; display:inline-block; width:10px; height:10px; margin-right:5px;"></i><span>Snowshoe</span><br>';
                div.innerHTML += '<i style="background:white; display:inline-block; width:10px; height:10px; margin-right:5px;"></i><span>Alpineski</span><br>';
                div.innerHTML += '<i style="background:lightgreen; display:inline-block; width:10px; height:10px; margin-right:5px;"></i><span>Walk</span><br>';
                return div;
            };
            legend.addTo(mymap);

            var legend = document.getElementById('legend');
            
            var activityColorMap = {
              'hike': 'red',
              'ride': 'violet',
              'run': 'orange',
              'snowshoe': 'blue',
              'alpineski': 'white',
              'walk': 'lightgreen'
            };

            var highlightedPolyline;

            for(var x=0; x<data.length; x++){
                
                var activityType = data[x].type.toLowerCase();
                var activityColor = activityColorMap[activityType];

                var activity = data[x];
                console.log(data[x].map.summary_polyline)
                var coordinates = L.Polyline.fromEncoded(data[x].map.summary_polyline).getLatLngs()
                console.log(coordinates)

                var polyline = L.polyline(

                    coordinates,
                    {
                        color: activityColor,
                        weight:4,
                        opacity:1,
                        lineJoin:'round'
                    }

                ).addTo(mymap);

                function displayPopup(event, activity) {

                        var popupContent = '<b>' + activity.name.toUpperCase() + '</b><br>' +
                                            '<b>Sport:</b> ' + activity.type + '<br>' +
                                            '<b>Date:</b> ' + new Date(activity.start_date_local).toLocaleDateString() + '<br>' +
                                            '<b>Time:</b> ' + new Date(activity.start_date_local).toLocaleTimeString() + '<br>' +
                                            '<b>Distance:</b> ' + (activity.distance / 1000).toFixed(2) + ' km<br>' +
                                            '<b>Elevation:</b> ' + activity.total_elevation_gain.toFixed(0) + ' m';  


                        /*if (activity.photos && activity.photos.primary) {
                          const photoId = activity.photos.primary.id;
                          const photoSize = 2000; // set the size of the photo you want to fetch
                          fetch(`https://www.strava.com/api/v3/activities/${activity.id}/photos?size=${photoSize}&photo_sources=true`)
                            .then(response => response.json())
                            .then(photos => {
                              const largestPhoto = photos.find(photo => photo.unique_id === photoId);
                              const photoUrl = largestPhoto.urls[`${photoSize}`];
                              popupContent += '<br><b>Photo:</b> <a href="' + photoUrl + '" target="_blank">View photo</a>';
                            })
                            .catch(error => console.error(error));
                        }*/


                        //if (activity.photos && activity.photos.length > 0) {
                          //var photoUrl = activity.photos[0].url; // Use the first photo for now*/
                          popupContent += '<br><b>Photo:</b> <a href="https://dgtzuqphqg23d.cloudfront.net/' + 'Fp8ZoYEBI1xw1l-z0aQoyRicFGX09a3wfnVrkQvjHss' + '-2048x1152.jpg' + '" target="_blank">View photo</a>';
                        //}

                        L.popup()
                          .setLatLng(event.latlng)
                          .setContent(popupContent)
                          .openOn(mymap);
                }

                // Save the activity color as a property of the polyline
                polyline.activityColor = activityColor;

                // Create closure to capture current activity
                (function (activity) {
                    // Add click event listener to polyline
                    polyline.on('click', function (event) {                    

                        // Remove highlight from previously clicked polyline
                        if (highlightedPolyline && highlightedPolyline !== this) {
                          highlightedPolyline.setStyle({
                            color: highlightedPolyline.activityColor,
                            weight: 4
                          });
                          highlightedPolyline.closePopup(); // close the popup
                        }

                        if (highlightedPolyline === this) {
                            highlightedPolyline = null;
                            this.setStyle({
                                color: this.activityColor,
                                weight: 4
                            });
                            this.closePopup(); // close the popup
                        } else {
                            highlightedPolyline = this;
                            this.setStyle({
                                color: 'yellow',
                                weight: 8
                            });
                            displayPopup(event, activity)
                        }
                    });   
                })(activity);
            }

     if (data.length === perPage) {
        getActivities(code, page + 1);
      }
    }
    )
        .catch(function (error) {
      console.log(error);
    });
}


function reAuthorize() {
  fetch(auth_link, {
    method: 'post',

    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({

            client_id: '102719',
            client_secret: '8bf4d136d70077115054b68f7abb5926c0b7610c',
            refresh_token: '19fbee45146c5b25a0b4eb443298d72cc81c63d7',
            grant_type: 'refresh_token'

    })

  }).then(res => res.json())
    .then(res => getActivities(res, 1))
}

reAuthorize()