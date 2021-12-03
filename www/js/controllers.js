angular.module('app.controllers', [])
  


.controller('mapCtrl', ['$scope', '$stateParams','BusService','$ionicModal' ,// The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams,BusService,$ionicModal) {
    //Create marker array to store markers
    $scope.markers = [];
    var radius = 300;//radius around user current location
     // Init a timeout variable to be used below
    var Searchtimeout = null;
    var watchID;

    //BUS PIN ICON
    var BusMarkerIcon = {
        url: "img/bus-pin.png", // url
        scaledSize: new google.maps.Size(30, 30), // scaled size
        origin: new google.maps.Point(4,4), // origin
        anchor: new google.maps.Point(12, 12) // anchor
    };

    

 /* ================ FUNCTIONS Call ================*/
    displayMap();
    displayUserCurrentLocation();


    /* ================ FUNCTIONS DECLARATIONS ================*/
    function displayUserCurrentLocation()
    {
        //GET USER CURRENT LOCATION
        if (navigator && navigator.geolocation) { //if browser support geolocation
         watchID =  navigator.geolocation.watchPosition(function(position) { 
            //WHENEVER LOCATION UPDATES,RESET MARKERS AND CIRCLE
            if ($scope.currentLocationCircle !=null)
            {
                $scope.currentLocationCircle.setMap(null);
                for (let i = 0; i < $scope.markers.length; i++) {
                    $scope.markers[i].setMap(null);
                    
                }   
            }
            //GET LAT/LONG OF current location
        $scope.currentlocation = {lat: position.coords.latitude, lng: position.coords.longitude};   

        //Create circle to show current location,and radius circle
        $scope.currentLocationCircle = new google.maps.Circle({
            strokeColor: '1bb6ff',
            strokeOpacity: .4,
            strokeWeight: 1,
            fillColor: '61a0bf',
            fillOpacity: 0.4,
            map: $scope.map,
            center: $scope.currentlocation,
            radius: radius //300 in metres
        });
        $scope.map.setCenter($scope.currentlocation);//set center and pan to center
        $scope.map.panTo(new google.maps.LatLng($scope.currentlocation.lat, $scope.currentlocation.lng));
        
        //Once user location is set, display bus stops near user location
        DisplayBusStopsNearUser();

        },function(err) {alert(err.message);});
        } else {alert('Browser does not support geolocation');}
    }//end function

    //DISPLAY MAP 
    function displayMap()
    {
        //CREATE MAP
        var mapOptions = {
          zoom : 18,
        center: new google.maps.LatLng(1.355914,103.853873),//SG Coordinates                
        mapTypeId: google.maps.MapTypeId.TERRAIN,
        clickableIcons: false,
        
    }
    //get div of map and display 
    $scope.map = new google.maps.Map(document.getElementById('map'), mapOptions); 
    }

    /*Retrieves and Display Bus Stops within radius of user current location*/
    function DisplayBusStopsNearUser()
    {
        //STEP1. GET BUS STOP LOCATIONS
        BusService.getAllBusStops().then(function(data)
        {
            for (var i = 0; i<data.length;i++)
            {
                var lat = parseFloat(data[i].lat);
                var lng = parseFloat(data[i].lng);
                var busStopLocation = new google.maps.LatLng(lat,lng);
                var busstopNo = data[i].no;
                //STEP2. DISPLAY BUS STOPS WITHIN USER LOCATION
                //IF BUS STOPS ARE WITHIN USER LOCATION,DISPLAY TO MAP
                var distanceFromCenter = google.maps.geometry.spherical.computeDistanceBetween(busStopLocation,$scope.map.getCenter());
                if (distanceFromCenter < radius)
                {
                    //CREATE MARKER FOR BUS STOPS
                    createBusMarkers(busStopLocation,busstopNo);
                }
            }
        })
    }

    //GET Bus stops arrivals
    function getBusStopArrivals(busstop)
    {
        BusService.getBusArrivalsByBusStops(busstop).then(function(data){

            //Display bus stop data 
            console.log(data['Services']);

            $scope.BusStopData = data['Services'];//Retrieves Buses and each of it's arrival time

            //ionic modal to display view of bottomsheet
            $ionicModal.fromTemplateUrl('templates/bottomsheet.html', {
                scope: $scope,
                animation: 'slide-in-up'
             }).then(function(modal) {
                $scope.modal = modal;
                modal.show();
             });
            

        })
    }//end function

    // Search for Bus No,and display all its bus codes on map
    function searchBusNo(busNo)
    {
        BusService.searchForBus(busNo).then(function(data)
        {
            //Get one direction 
            console.log(data['1']);
            var stops = data['1'].stops;//get number of stops
            for (var i = 0 ;i<stops.length;i++)
            {
                //Get Bus stop 
                var busstopNo = stops[i];
                searchBusStop(busstopNo);//Display on map
            }

        })
    }

    //Search for Bus Stop and Display on map
    function searchBusStop(busstopNo)
    {
        BusService.searchForBusStop(busstopNo).then(function(data)
        {
            var busStopLocation = new google.maps.LatLng(parseFloat(data.lat),parseFloat(data.lng));
            var busstop = data.no;
            createBusMarkers(busStopLocation,busstop);

        })
    }

    //Create Bus Markers
    function createBusMarkers(busStopLocation,busstopNo)
    {   
        var marker = new google.maps.Marker({
            map: $scope.map,
            draggable: false,
            animation: google.maps.Animation.DROP,
            position: busStopLocation,
            icon:BusMarkerIcon
          })
          google.maps.event.addListener(marker, 'click', function() {
            // Open an info window when the marker is clicked on, containing the text
            // of the step.
            getBusStopArrivals(busstopNo);

          });
          //ADD Markers to markers array for further usage
        $scope.markers.push(marker);
    }


    //Search function for input field
    //used on a ng-Changed directive
    $scope.search = function search(query)
    {
        //when Searching,clear all markers on map
        for (let i = 0; i < $scope.markers.length; i++) {$scope.markers[i].setMap(null);}

    clearTimeout(Searchtimeout);//RESET TIMER
    Searchtimeout = setTimeout(function () {

        if (query.length == 0) //if not bus,show current location
        {
            directionsDisplay.setMap(null);
            for (var i = 0; i < $scope.markers.length; i++) { $scope.markers[i].setMap(null)};
            //If no value in search field,display bus near user
            navigator.geolocation.clearWatch(watchID);
            displayUserCurrentLocation();
        }

        if (Number.isInteger( parseInt(query) ))//if is number
        {
            $scope.currentLocationCircle.setMap(null);
            $scope.markers = [];//Clear markers in map
            if (query.length == 5)//BUS CODE
            {
                searchBusStop(query);
            }
            else
            {
                //BUS NUMBER
                searchBusNo(query);
            }

        }
        else //if not number
        {
            //DESTINATION SEARCH
            // First, remove any existing markers from the map.
        $scope.currentLocationCircle.setMap(null);
        for (var i = 0; i < $scope.markers.length; i++) { $scope.markers[i].setMap(null)};
          geocodeAddressAndRoute(query);
         
        }
    }, 2000);//miliseconds
    }//end search function

     //GEOCODE, ADDRESS -> COORDINATES
      var geocoder = new google.maps.Geocoder();
      function geocodeAddressAndRoute(query) {
        var address = query;
        geocoder.geocode({'address': address}, function(results, status) {
          if (status === 'OK') {//success
 
            //Set destination to center of map
            $scope.map.setCenter(results[0].geometry.location);
            var destination = 
            {
                lat:results[0].geometry.location.lat(),
                lng:results[0].geometry.location.lng()
            };
            calculateAndDisplayRoute(destination);//Pass destination coordinates to route
          } 
          else {alert('Geocode was not successful for the following reason: ' + status);}
        });
      }

      // Instantiate a directions service.
    var directionsService = new google.maps.DirectionsService;
    // Create a renderer for directions and bind it to map.
    var directionsDisplay = new google.maps.DirectionsRenderer({map: $scope.map});

    //Function to display route to destination on map
      function calculateAndDisplayRoute(destination) {
        directionsDisplay.setMap($scope.map);
        // Retrieve the start and end locations and create a DirectionsRequest using
        // Transit directions.
        directionsService.route({
          origin: {lat:$scope.currentlocation.lat,lng:$scope.currentlocation.lng},
          destination: {lat:destination.lat,lng:destination.lng},
          travelMode: 'TRANSIT'//Via bus only
        }, function(response, status) {

          // Route the directions and pass the response to a function to create
          // markers for each step.
          if (status === 'OK') {
  
            directionsDisplay.setDirections(response);//Display route on map
            showSteps(response, $scope.markers);//Display directions
          } else {
            alert('Directions request failed due to ' + status);
          }
        });
      }
      

      function showSteps(directionResult) {
        // For each step, place a marker, and add the text to the marker's infowindow.
        // Also attach the marker to an array so we can keep track of it and remove it
        // when calculating new routes.
        var myRoute = directionResult.routes[0].legs[0];
        for (var i = 0; i < myRoute.steps.length; i++) {
         
          $scope.markers[i].setMap($scope.map);//Display route markers
          $scope.markers[i].setPosition(myRoute.steps[i].start_location);
          InstructionInfo($scope.markers[i], myRoute.steps[i].instructions);//set instructions on marker click
        }
      }

      function InstructionInfo( marker, text) {
          // Instantiate an info window to hold directions text.
        var stepDisplay = new google.maps.InfoWindow;
        google.maps.event.addListener(marker, 'click', function() {
          // Open an info window when the marker is clicked on, containing the text
          // of the step.
          stepDisplay.setContent(text);
          stepDisplay.open($scope.map, marker);
          //TODO:INSTEAD OF INFO WINDOW,DISPLAY ON BOTTOM SHEET
        });
      }
}])
   
.controller('favouritesCtrl', ['$scope', '$stateParams','$ionicModal' ,// The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams,$ionicModal) {
    
    $ionicModal.fromTemplateUrl('templates/bottomsheet.html', {
        scope: $scope,
        animation: 'slide-in-up'
     }).then(function(modal) {
        $scope.modal = modal;
     });
      
     $scope.openModal = function() {
        $scope.modal.show();
        console.log('show');
     };
      
     $scope.closeModal = function() {
        $scope.modal.hide();
     };
      
    //  //Cleanup the modal when we're done with it!
    //  $scope.$on('$destroy', function() {
    //     $scope.modal.remove();
    //  });
      
    //  // Execute action on hide modal
    //  $scope.$on('modal.hidden', function() {
    //     // Execute action
    //  });
      
    //  // Execute action on remove modal
    //  $scope.$on('modal.removed', function() {
    //     // Execute action
    //  });
}])
   
.controller('historyCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {


}])
      
.controller('settingsCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {


}])
 