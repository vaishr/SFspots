
var autocomplete;
var map;
var myLayer;
var input;
var geojson = [];


function templateGeo(title, lat, lng, description, type) {
    return {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [lat, lng]
        },
        "properties": {
            "title": title,
            "description": description,
            "type": type,
            "display": true
        }
    };
}

L.mapbox.accessToken = "pk.eyJ1IjoidmFpcmVkZHkxMSIsImEiOiJhYjVmNmY2MWQ3MmFiNThkZjBiZTA1MzdkNTg3NTJhZiJ9.6YTxS5LbsOmXzVcUWzgE7w";




var app = angular.module("app", ["firebase"]);

app.controller("MapCtrl", ["$scope", "$timeout", function ($scope, $timeout) {
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
        $scope.geojson = geojson;
        $scope.submit = function () {
            $scope.placeType;
            var note = $scope.placeNote;
            var place = autocomplete.getPlace();
            var lat = place.geometry.location.lat();
            var lng = place.geometry.location.lng();
            console.log("place", place);
            console.log($scope.placeNote);
            console.log("type:", $scope.placeType);
            geojson.push(templateGeo(place.name, lat, lng, note, $scope.placeType));
            console.log("geoJson", geojson);
            var addMarker = function (lati, long, name, description, type) {
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
                var newMarker = L.marker([lati, long], {
                    icon: L.mapbox.marker.icon({
                        'marker-color': symbols[type],
                        'marker-symbol': type,
                        'marker-size': 'large'
                    })
                })
                var content = "<h2>" + name + "</h2><h3>" + description + "</h3>";
                newMarker.addTo(map);
                newMarker.bindPopup(content);
            };
            addMarker(lat, lng, place.name, note, $scope.placeType);
            $scope.placeType = "star";
            $scope.placeNote = "";
        };
    }]);

// app.directive('placesAutocomplete', function() {
//     restrict: 'C',

// });

angular.element(document).ready(function () {
    angular.bootstrap(document, [app.name], {
        strictDi: true
    });
});