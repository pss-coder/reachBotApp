angular.module('app.services', [])

//BUS SERVICE
.factory('BusService', ['$http',function($http){

    //NEED PROXIES,ELSE CANNOT CONNECT TO LTA 
//ENSURE PROXY URL SET UP IN ionic.config.json
  //MAKE SURE PORT IS SAME AS IN URL
  var url = 'http://localhost:8100/lta/';
  var config = {
      method:'GET',
      headers:{
        'AccountKey':'dusZRZxETVOQ8PGmjFuLYw==',

      }
    };

    //ONLY GET FIRST 500
  return {
    //QUERY BUS STOP NO. TO GET BUS ARRIVALS
    getBusArrivalsByBusStops:function(busstopNo)
    {
      return $http.get(url+'BusArrivalv2?BusStopCode='+busstopNo,config).then(function(response){return response.data})
    },
    getAllBusServices() //GET ALL INFORMATION OF BUSES
    {
      return $http.get('sg_BusServices.json').then(function(response){return response.data})
    },
    searchForBus(busNo)
    {
      //sg_BusServices.json
      //https://busrouter.sg/data/2/bus-services/2.json.
      return $http.get('https://busrouter.sg/data/2/bus-services/'+busNo+'.json').then(function(response)
      {
        return response.data;
      })
    },
    getBusRoutes() //GET ALL ROUTE INFORMATION OF BUSES
    {
      return $http.get(url+'BusRoutes',config).then(function(response){return response.data})
    },
    getAllBusStops() //GET ALL BUS STOPS
    {
      return $http.get('bus-stops.json').then(function(response){return response.data})
    },
    searchForBusStop(busstopNo)
    {
      return $http.get('bus-stops.json').then(function(response){
        for (let i = 0; i < response.data.length; i++) {
            if (response.data[i]['no'] == busstopNo)
            {
              return response.data[i]
            }
        }
      })
    }

  }

}])
