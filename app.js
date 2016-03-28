
var autocomplete;
var map;
var myLayer;
var input;


function templateGeo(place, note, type) {
    var lat = place.geometry.location.lat();
    var lng = place.geometry.location.lng();

    //remove country and zip code from address
    var formatAddress = function(place) {
        var formatted_add = place.formatted_address;
        if (formatted_add.indexOf(", CA") > -1) {
            var index = formatted_add.indexOf(", CA");
            formatted_add = formatted_add.slice(0, index+4);
        }
        return formatted_add;
    }
    
    // var photoURLs = [];
    // function getPhotos(place) {
    //     if (place.photos)
    //     for (var i = 0; i < 10; i++) {
    //         photoURLs.push(place.photos[i].getUrl({'maxWidth': 800, 'maxHeight': 800}));
    //     }
    //     return photoURLs;
    // }
    // getPhotos(place);
    
    // console.log('photos', photoURLs);
   
    return {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [lat, lng]
        },
        "properties": {
            "title": place.name,
            "place_id": place.place_id,
            "description": note,
            "type": type,
            "website": place.website,
            "phone_number": place.formatted_phone_number,
            "address": formatAddress(place)
            //"opening_hours": place.opening_hours.weekday_text,
            //"images": getPhotos(place)
        }
    };
}

var symbols = {
    "cafe" : "#FF9800",
    "restaurant" : "#EEFF41",
    "shop" : "#FF5722",
    "bar": "#F50057",
    "theatre": "#D500F9",
    "park" : "#00C853",
    "pitch" : "#76FF03",
    "camera": "#1DE9B6",
    "roadblock": "#455A64",
    "star" : "#00B0FF"
};

L.mapbox.accessToken = "pk.eyJ1IjoidmFpcmVkZHkxMSIsImEiOiJhYjVmNmY2MWQ3MmFiNThkZjBiZTA1MzdkNTg3NTJhZiJ9.6YTxS5LbsOmXzVcUWzgE7w";

var app = angular.module("app", ["firebase"]);

app.controller("MapCtrl", ["$scope", "$timeout", function ($scope, $timeout) {
        $scope.places = [];
        $scope.markers = [];
        $scope.place = "";
        $scope.init = function() {
             input = document.getElementById('placeInput');
             autocomplete = new google.maps.places.Autocomplete(input);
             map = L.mapbox.map("map", "mapbox.wheatpaste", {attributionControl: false}).addControl(L.mapbox.shareControl());;
             map.setView([37.763, -122.482], 13);
             myLayer = L.mapbox.featureLayer().addTo(map);
            }        
        $scope.placeType = "star";
        google.maps.event.addDomListener(window, "load", $scope.init);
        $scope.resetMap = function() {
            map.setView([37.763, -122.482], 13);
        }
        $scope.filter = function() {
            
        }
        $scope.addMarker =  function (loc, note, type) {
                var newMarker = L.marker([loc.geometry.coordinates[0], loc.geometry.coordinates[1]], {
                    icon: L.mapbox.marker.icon({
                        'marker-color': symbols[type],
                        'marker-symbol': type,
                        'marker-size': 'large'
                    })
                });

                newMarker.id = loc.properties.place_id;

                console.log("newMarkerID", newMarker.id);

                
                var content = "<h2><strong>" + loc.properties.title + "</strong></h2>";
                if (loc.properties.address) {
                        content += "<h3>"+ loc.properties.address +"</h3>"
                }
                if (note) {
                        content += "<h4><i>" + note + "</i></h4>";
                }
                if (loc.properties.phone_number) {
                    content += "<br><p>" + loc.properties.phone_number + "</p>";

                }
                $scope.markers.push(newMarker);
                newMarker.addTo(map);
                newMarker.bindPopup(content);
        };

        $scope.submit = function () {
            var note = $scope.placeNote;
            var type = $scope.placeType;
            var place = autocomplete.getPlace();
            
            function checkErr() {
            $scope.repeatPlace = false;
            $scope.noLocationErr = false;

            if (!$scope.place) {
                $scope.noLocationErr = true;
                $scope.placeNote = "";
                $scope.placeType = "star";
                return true;
                }

            for (var i = 0; i < $scope.places.length; i++) {
                    if (place.place_id === $scope.places[i].properties.place_id && $scope.place) {
                        $scope.repeatPlace = true;  
                        $scope.placeNote = "";
                        $scope.placeType = "star"; 
                        return true;
                    }
                }
            return false;
            }
      
         
        if (!checkErr()) {
                var newPlace = templateGeo(place, note, type);
                $scope.addMarker(newPlace, note, type);
                $scope.noLocationErr = false;
                $scope.repeatPlace = false;
                $scope.places.push(newPlace);
              
                //reset values to default after submit 
                $scope.place = "";
                place = autocomplete.getPlace();
                $scope.placeType = "star";
                $scope.placeNote = "";

                 
           
            
            // if (!newPlace.properties.images.length) {
            //     $scope.hasImage = false;
            // }
            // if (newPlace.properties.images.length > 0) {
            //     $scope.hasImage = true;
            // }
        }

        };
       
        $scope.removePlace = function(index) {
            var place_ID = $scope.places[index].properties.place_id;
            console.log("placeidPlaces", place_ID);
            for (var i = 0; i < $scope.markers.length; i++) {
                if ($scope.markers[i].id === place_ID) {
                     var markerToRemove = $scope.markers[i];
                     map.removeLayer(markerToRemove);
                }
            }
            $scope.places.splice(index, 1);
        }
    }]);

angular.element(document).ready(function () {
    angular.bootstrap(document, [app.name], {
        strictDi: true
    });
});