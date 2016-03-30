//google places autocomplete
var autocomplete;

//mapbox map
var map;


//template for pushing new places into places array
var templateGeo = function(place, note, type) {
    var lat = place.geometry.location.lat();
    var lng = place.geometry.location.lng();
    console.log('place', place);
    console.log('placeTemplate', placeTemplate);

    //remove country and zip code from address
    function formatAddress(place) {
        var formatted_add = place.formatted_address;
        if (formatted_add.indexOf(", CA") > -1) {
            var index = formatted_add.indexOf(", CA");
            formatted_add = formatted_add.slice(0, index + 4);
        }
        return formatted_add;
    }

    //object to be returned from calling this function
    var placeTemplate = {
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
        }
    }

    //add photos if result from places api includes photos
    var placePhotos = function(place) {
        var photoURLs = [];
        var numberOfPhotos = 10;
        if (place.photos) {
            if (place.photos.length < 10) {
                numberOfPhotos = place.photos.length;
            }
            for (var i = 0; i < numberOfPhotos; i++) {
                photoURLs.push(place.photos[i].getUrl({
                    'maxWidth': 800,
                    'maxHeight': 800
                }));
            }
            placeTemplate.photos = photoURLs;
        }
    }

    //add open hours if result from places api includes opening hours
    var openHours = function(place) {
        if (!place.opening_hours) {
            return;
        }
        else { placeTemplate.openingHours = place.opening_hours.weekday_text };
    }

    placePhotos(place);
    openHours(place);

    console.log('placeTemplate', placeTemplate);

    return placeTemplate;
};



//icons and colors for mapbox markers
var symbols = {
    "cafe": "#FF9800",
    "restaurant": "#EEFF41",
    "shop": "#FF5722",
    "bar": "#F50057",
    "theatre": "#D500F9",
    "park": "#00C853",
    "pitch": "#76FF03",
    "camera": "#1DE9B6",
    "roadblock": "#455A64",
    "star": "#00B0FF"
};

L.mapbox.accessToken = "pk.eyJ1IjoidmFpcmVkZHkxMSIsImEiOiJhYjVmNmY2MWQ3MmFiNThkZjBiZTA1MzdkNTg3NTJhZiJ9.6YTxS5LbsOmXzVcUWzgE7w";

var app = angular.module("app", ["firebase", "ngMaterial"]);

app.controller("AppCtrl", ["$scope", "$mdDialog", "$mdMedia", function($scope, $mdDialog, $mdMedia) {
    //storage for added places
    $scope.places = [];
    //storage for added markers
    $scope.markers = [];
    //$scope.place refers to text entered in add place field
    $scope.place = "";
    $scope.init = function() {
        var input = document.getElementById('placeInput');
        //set autocomplete in place input field
        autocomplete = new google.maps.places.Autocomplete(input);
        //add mapbox map
        map = L.mapbox.map("map", "mapbox.wheatpaste", {
            attributionControl: false
        }).addControl(L.mapbox.shareControl());;
        //set view to san francisco 
        map.setView([37.763, -122.482], 13);
        var myLayer = L.mapbox.featureLayer().addTo(map);
    }

    $scope.placeType = "star";
    google.maps.event.addDomListener(window, "load", $scope.init);

    //set map view to san francisco 
    $scope.resetMap = function() {
        map.setView([37.763, -122.482], 13);
    }
    $scope.filter = function() {

    }
    $scope.hasAdditionalInfo = function(placeIndex) {
        var place = $scope.places[placeIndex];
        if (place.properties.phone_number || place.properties.website || place.photos) {
            return true;
        }
    return false;
    }

    $scope.addMarker = function(loc, note, type) {
        var newMarker = L.marker([loc.geometry.coordinates[0], loc.geometry.coordinates[1]], {
            icon: L.mapbox.marker.icon({
                'marker-color': symbols[type],
                'marker-symbol': type,
                'marker-size': 'large'
            })
        });
        newMarker.setBouncingOptions({
                bounceHeight: 8,
                bounceSpeed: 30
            }),
            newMarker.id = loc.properties.place_id;

        console.log("newMarkerID", newMarker.id);
        console.log('marker', newMarker);


        var content = "<h2><strong>" + loc.properties.title + "</strong></h2>";
        if (loc.properties.address) {
            content += "<h3>" + loc.properties.address + "</h3>"
        }
        if (note) {
            content += "<h4><i>" + note + "</i></h4>";
        }
        $scope.markers.push(newMarker);
        console.log("$scope.markers", $scope.markers);
        newMarker.addTo(map);
        newMarker.bindPopup(content);
    };

    $scope.markerAnimate;
    $scope.markerUnanimate;

    //animate leaflet marker on map on mouseover of corresponding place in list, using Leaflet smooth marker bouncing plugin
    $scope.animateMarker = function(placeIndex) {
        console.log("calling animateMarker");
        var markerID = $scope.places[placeIndex].properties.place_id;
        for (var i = 0; i < $scope.markers.length; i++) {
            if ($scope.markers[i].id === markerID) {
                $scope.markerAnimate = i;
            }
        }
        $scope.markers[$scope.markerAnimate].bounce(3);
    };

    //stop marker animation on mouseout
    $scope.stopAnimate = function(placeIndex) {
        var markerID = $scope.places[placeIndex].properties.place_id;
        for (var i = 0; i < $scope.markers.length; i++) {
            if ($scope.markers[i].id === markerID) {
                $scope.markerUnanimate = i;
            }
            $scope.markers[$scope.markerUnanimate].stopBouncing();
        }
    }

    //called upon submitting a new place, pushes applies template function to place and then adds it to $scope.places 
    $scope.submit = function() {
        var note = $scope.placeNote;
        var type = $scope.placeType;
        var place = autocomplete.getPlace();


        console.log('place', place);
        console.log('$scope.place', $scope.place);

        function checkErr() {
            $scope.repeatPlace = false;
            $scope.noLocationErr = false;

            if (!$scope.place || place === undefined) {
                $scope.noLocationErr = true;
                $scope.placeNote = "";
                $scope.placeType = "star";
                return true;
            }

            for (var i = 0; i < $scope.places.length; i++) {
                if (place.place_id === $scope.places[i].properties.place_id) {
                    $scope.repeatPlace = true;
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
            $scope.place = "";


            // if (!newPlace.properties.images.length) {
            //     $scope.hasImage = false;
            // }
            // if (newPlace.properties.images.length > 0) {
            //     $scope.hasImage = true;
            // }
        }

        $scope.placeNote = "";
        $scope.placeType = "star";
        place = undefined;
    };

    $scope.removePlace = function(index) {
        var place_ID = $scope.places[index].properties.place_id;
        for (var i = 0; i < $scope.markers.length; i++) {
            if ($scope.markers[i].id === place_ID) {
                var markerToRemove = $scope.markers[i];
                map.removeLayer(markerToRemove);
            }
        }
        $scope.places.splice(index, 1);
    };

    $scope.showAlert = function(ev, placeIndex) {
        if ($scope.hasAdditionalInfo(placeIndex)) {
            var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;
            $mdDialog.show({
                controller: "DialogCtrl",
                templateUrl: 'modal.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                controllerAs: 'ctrl',
                bindToController: true,
                clickOutsideToClose: true,
                fullscreen: useFullScreen,
                locals: {
                    place: $scope.places[placeIndex]
                }
            });
        }

        $scope.$watch(function() {
            return $mdMedia('xs') || $mdMedia('sm');
        }, function(wantsFullScreen) {
            $scope.customFullscreen = (wantsFullScreen === true);
        });
    };


}]);

app.controller("DialogCtrl", ["$scope", "$mdDialog", function($scope, $mdDialog) {
    $scope.hide = function() {
        $mdDialog.hide();
    };
    $scope.cancel = function() {
        $mdDialog.cancel();
    };
}]);

angular.element(document).ready(function() {
    angular.bootstrap(document, [app.name], {
        strictDi: true
    });
});
