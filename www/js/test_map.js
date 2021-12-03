//TODO:
    /*
        CREATE MAP SERVICE:RETRIEVE MAP,BUS MARKER,
        CREATE BUS SERVICE:RETRIEVE BUSES BASED ON REQUIRED FIELDS
        CREATE SEARCH FIELD:WHATEVER USER SEARCHES FOR, WILL KNOW ROUTE TO IT VIA BUS
        FAVOURITES SERVICES:
    */

    var myStyles =[
        {
            //hide bus stops
            //add custom bus icon
            featureType: "poi",
            elementType: "labels",
            stylers: [
                  { visibility: "off" }
            ]
        }
    ];

    function handleLocationError(browserHasGeolocation, infoWindow, pos) {
        infoWindow.setPosition(pos);
        infoWindow.setContent(browserHasGeolocation ?
                              'Error: The Geolocation service failed.' :
                              'Error: Your browser doesn\'t support geolocation.');
        infoWindow.open($scope.map);
      }

    var center = L.bounds([1.56073, 104.11475], [1.16, 103.502]).getCenter();
				var map = L.map('mapdiv',{
                    center: [center.x, center.y],
                    zoom: 12,
                    zoomControl:true
                })

				var basemap = L.tileLayer('https://maps-{s}.onemap.sg/v3/Default/{z}/{x}/{y}.png', {
					detectRetina: true,
					maxZoom: 18,
                    minZoom: 11,
                    
				});

				map.setMaxBounds([[1.56073, 104.1147], [1.16, 103.502]]);
                
                basemap.addTo(map);
                
                map.on('click', addMarker);
               
                var LeafIcon = L.Icon.extend({
                    options: {
                       iconSize:     [38, 95],
                       shadowSize:   [50, 64],
                       iconAnchor:   [22, 94],
                       shadowAnchor: [4, 62],
                       popupAnchor:  [-3, -76]
                    }
                });

                var greenIcon = new LeafIcon({
                    iconUrl: 'http://leafletjs.com/examples/custom-icons/leaf-green.png',
                    shadowUrl: 'http://leafletjs.com/examples/custom-icons/leaf-shadow.png'
                })


                function addMarker(e)
                {
                    var Marker = L.marker(e.latlng,{
                        draggable: true,
                        icon: greenIcon
                   })
                

                   Marker.addTo(map).bindPopup("My lat long is" + e.latlng.lat + "long is\n" + e.latlng.lng);
                }



    // var GeoMarker = new GeolocationMarker();
    // GeoMarker.setCircleOptions({
    //     fillColor: '#808080',
    //     radius:4000,
    // });
    

    // google.maps.event.addListenerOnce(GeoMarker, 'position_changed', function() {
    //     $scope.map.setCenter(this.getPosition());
    //     $scope.map.fitBounds(this.getBounds());
    //     console.log(GeoMarker);
    // });

    // google.maps.event.addListener(GeoMarker, 'geolocation_error', function(e) {
    //   alert('There was an error obtaining your position. Message: ' + e.message);
    // });

    // GeoMarker.setMap($scope.map);