var geojson = [];
var autocomplete;
var addMarker;
var map;
var input;
var myLayer;


function init() {
    input = document.getElementById("placeInput");
    autocomplete = new google.maps.places.Autocomplete(input);
    map = L.mapbox.map("map", "mapbox.wheatpaste");
    map.setView([37.783, -122.455], 14);
    myLayer = L.mapbox.featureLayer().addTo(map);
};

function templateGeo(title, lat, lng, description) {
    return {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [lat, lng]
        },
        "properties": {
            "title": title,
            "description": description,
            "marker-color": "#3ca0d3",
            "marker-size": "large"
        }
    };
}

google.maps.event.addDomListener(window, "load", init);
L.mapbox.accessToken = "pk.eyJ1IjoidmFpcmVkZHkxMSIsImEiOiJhYjVmNmY2MWQ3MmFiNThkZjBiZTA1MzdkNTg3NTJhZiJ9.6YTxS5LbsOmXzVcUWzgE7w";


var app = angular.module("app", ["firebase"]);

app.controller("MapCtrl", ["$scope", "$timeout", function ($scope, $timeout) {
        $scope.resetMap = function() {
            map.setView([37.783, -122.455], 14);
        }
        $scope.submit = function () {
            var note = $scope.placeNote;
            var place = autocomplete.getPlace();
            var lat = place.geometry.location.lat();
            var lng = place.geometry.location.lng();
            console.log("place", place);
            console.log($scope.placeNote);
            geojson.push(templateGeo(place.name, lat, lng, note));
            console.log("geoJson", geojson);
            addMarker = function (lati, long, name, description) {
                var newMarker = L.marker([lati, long]);
                var content = "<h2>" + name + "</h2><h3>" + description + "</h3>";
                newMarker.addTo(map);
                newMarker.bindPopup(content);
                map.scrollWheelZoom.disable();
            };
            addMarker(lat, lng, place.name, note);
        };
    }]);

angular.element(document).ready(function () {
    angular.bootstrap(document, [app.name], {
        strictDi: true
    });
});