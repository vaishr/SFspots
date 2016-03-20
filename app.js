var geojson = [];
var autocomplete;
var addMarker;
var map;
var myLayer;
var input;

function init() {
    input = document.getElementById('placeInput');
    autocomplete = new google.maps.places.Autocomplete(input);
    map = L.mapbox.map("map", "mapbox.wheatpaste").addControl(L.mapbox.shareControl());;
    map.setView([37.763, -122.482], 13);
    myLayer = L.mapbox.featureLayer().addTo(map);
};

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
            "type": type
        }
    };
}

google.maps.event.addDomListener(window, "load", init);
L.mapbox.accessToken = "pk.eyJ1IjoidmFpcmVkZHkxMSIsImEiOiJhYjVmNmY2MWQ3MmFiNThkZjBiZTA1MzdkNTg3NTJhZiJ9.6YTxS5LbsOmXzVcUWzgE7w";




var app = angular.module("app", ["firebase"]);

app.controller("MapCtrl", ["$scope", "$timeout", function ($scope, $timeout) {
        $scope.resetMap = function() {
            map.setView([37.763, -122.482], 13);
        }
        $scope.placeType;
        $scope.submit = function () {
            var note = $scope.placeNote;
            var place = autocomplete.getPlace();
            var lat = place.geometry.location.lat();
            var lng = place.geometry.location.lng();
            console.log("place", place);
            console.log($scope.placeNote);
            console.log("type:", $scope.placeType);
            geojson.push(templateGeo(place.name, lat, lng, note));
            console.log("geoJson", geojson);
            addMarker = function (lati, long, name, description, type) {
                var symbols = {
                    "cafe" : "#FF9800",
                    "shop" : "#FF5722",
                    "bar": "#F50057",
                    "theatre": "#D500F9",
                    "marker" : "#00B0FF",
                    "park" : "#00C853",
                    "active" : "#76FF03",
                    "tourist": "#1DE9B6"
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
                map.scrollWheelZoom.disable();
            };
            addMarker(lat, lng, place.name, note, $scope.placeType);
        };
    }]);

angular.element(document).ready(function () {
    angular.bootstrap(document, [app.name], {
        strictDi: true
    });
});