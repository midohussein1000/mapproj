//places and info about some them
var places = [{
        name: "Chick-fil",
        hours: "8:00 am to 10:00 pm",
        address: "Chick-fil-A 2222 Shearn St Houston, TX 77007",
        url: "http://www.Chick-fil.com",
        lat: "29.774813",
        lng: "-95.381082",
        instagramTag: "Chick-fil"
    },
    {
        name: "Chili's Grill & Bar",
        hours: "11:00 am to 11pm",
        address: "2425 Katy Fwy, Houston, TX 77007",
        url: "http://www.chilis.com/",
        lat: "29.776315",
        lng: "-95.383442",
        instagramTag: "chilis"
    },
    {
        name: "Buffalo Wild Wings",
        hours: "Open Year Round",
        address: "Holyrood Park",
        url: "http://www.buffalowildwings.com",
        lat: "29.769509",
        lng: "-95.400306",
        instagramTag: "Buffalo"
    },
    {
        name: "Cadillac Bar",
        hours: "10am - 5pm",
        address: "Chambers Street",
        url: "http://www.cadillacbar.com",
        lat: "29.776489",
        lng: "-95.408942",
        instagramTag: "Cadillac Bar"
    },
    {
        name: "Cyclone Anaya's Mexican Kitchen",
        hours: "7am - 7:15pm",
        address: "1710 Durham Dr, Houston, TX 77007",
        url: "http://www.cycloneanaya.com",
        lat: "29.775751",
        lng: "-95.410419",
        instagramTag: "CycloneAnaya"
    },
    {
        name: "Lupe Tortilla",
        hours: "Check site for tour times",
        address: "1511 Shepherd Dr, Houston, TX 77007",
        url: "http://www.lupetortilla.com/",
        lat: "29.774598",
        lng: "-95.409831",
        instagramTag: "Lupe Tortilla"
    }

];

// for each part of a location created ko.observables
var Location = function(data) {
    this.name = ko.observable(data.name);
    this.hours = ko.observable(data.hours);
    this.address = ko.observable(data.address);
    this.url = ko.observable(data.url);
    this.postcode = ko.observable(data.postcode);
    this.lat = ko.observable(data.lat);
    this.lng = ko.observable(data.lng);
    this.instagramTag = ko.observable(data.instagramTag);
};

// use google map api
function loadScript() {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyA0kzuiHbWUsovsPgoPSzv--viShZ4mVRo' +
        '&signed_in=true&callback=initialize';
    script.onerror = function() {
        alert("please try again can not load");
    };

    document.body.appendChild(script);
}

//calling for google maps back
function initialize() {
    ko.applyBindings(new viewModel());
}

var viewModel = function() {
    var self = this;
    var selectedIcon = 'http://www.google.com/mapfiles/marker.png',
        unselectedIcon = 'http://www.google.com/mapfiles/marker_green.png',
        selectedColor = 'green',
        unselectedColor = 'red';
    this.placeList = ko.observableArray([]); //array of locations data and markers associated with each location
    arrayOfMarkers = [];
    self.filter = ko.observable('');
    self.currentLocation = ko.observable(defaultName); //set current location to default
    //variables for instagram , it may donnot work 
    var defaultName = "Edinburgh";
    var defaultTag = "edinburgh";
    //push all locations in placeList array
    places.forEach(function(placeItem) {
        self.placeList.push(new Location(placeItem));
    });
    // loading the map
    this.drawMap = function() {
        var edinburgh = new google.maps.LatLng(29.780669, -95.386003);
        var mapOptions = {
            zoom: 14,
            center: edinburgh,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var map = new google.maps.Map(document.getElementsByClassName('map-canvas')[0], mapOptions);

        //loop through ko placeList to change infoWindow and add marker for each location as object in placeList.
        var i;
        for (i = 0; i < self.placeList().length; i++) {

            var streetViewUrl = 'http://maps.googleapis.com/maps/api/streetview?size=200x200&location=' +
                self.placeList()[i].lat() + ',' + self.placeList()[i].lng();

            //Add details for infoWindow - 
            var contentString = '<div id="content">' +
                '<h3>' + self.placeList()[i].name() + '</h3>' +
                '<p>Address: ' + self.placeList()[i].address() + '</p>' +
                '<p>Postcode: ' + self.placeList()[i].postcode() + '</p>' +
                '<p>Hours: ' + self.placeList()[i].hours() + '</p>' +
                '<a href = "' + self.placeList()[i].url() + '" target="_blank">Website</a>' +
                '<img src = "' + streetViewUrl + '">' +
                '</div>';
            var infowindow = new google.maps.InfoWindow({
                content: contentString
            });

            // make marker
            var currentLatLng = new google.maps.LatLng(self.placeList()[i].lat(), self.placeList()[i].lng());
            var marker = new google.maps.Marker({
                position: currentLatLng,
                map: map,
                title: self.placeList()[i].name(),
                icon: unselectedIcon
            });
            arrayOfMarkers.push(marker);
            //use event listner for click and closeclick
            google.maps.event.addListener(marker, "click", self.markerReset);
            google.maps.event.addListener(infowindow, "closeclick", self.markerReset);


            google.maps.event.addListener(marker, "click", (function(marker, contentString, infoWindow) {
                return function() {
                    infowindow.setContent(contentString);
                    infowindow.open(map, this);
                    self.currentLocation(this.title);
                    marker.setIcon(selectedIcon);
                    self.getInstagram();
                };
            })(marker, contentString, infowindow));
        }

    };

    //Reset marker colors and thename back to unselected color
    self.markerReset = function() {
        for (var i = 0; i < arrayOfMarkers.length; i++) {
            arrayOfMarkers[i].setIcon(unselectedIcon);
            //Reset thename colors in list
            $("h3").css('color', unselectedColor);
        }
    };

    //Needed for filter in sidebar
    self.stringStartsWith = function(string, startsWith) {
        string = string || "";
        if (startsWith.length > string.length)
            return false;
        return string.substring(0, startsWith.length) === startsWith;
    };

    //Filter the items using the filter text
    self.filteredItems = ko.computed(function() {
        var filter = self.filter().toLowerCase();
        if (!filter) { //no search term entered so show all markers
            return self.placeList(); //nothing entered by user, so show entire list
        } else { //a search term is entered
            return ko.utils.arrayFilter(self.placeList(), function(Location) {
                return self.stringStartsWith(Location.name().toLowerCase(), filter);
            });
        }
    }, self.placeList, arrayOfMarkers);

    //display markers of the filtered items
    self.filteredMarkers = ko.computed(function() { //beginning of function
        for (var k = 0; k < self.filteredItems().length; k++) {
            for (var i = 0; i < arrayOfMarkers.length; i++) { //for each filteredItem, find the corresponding marker
                if (arrayOfMarkers[i].title === self.filteredItems()[k].name()) {
                    arrayOfMarkers[i].setVisible(true);
                } else {
                    arrayOfMarkers[i].setVisible(false);
                }
            }
        }
        var filter = self.filter().toLowerCase();
        if (!filter) { //no search term entered so show all markers
            for (var j = 0; j < arrayOfMarkers.length; j++) {
                arrayOfMarkers[j].setVisible(true);
            }
        }
    }, self.filteredItems, arrayOfMarkers);

    //code to sync clicked place in side bar with marker, making both selected red
    //when user clicks a place in the sidebar, make the corresponding marker red
    self.setPlace = function(data, event) {
        self.markerReset(); //ensure all the markers and sidebar names are green (unselected)
        var selectedMarker,
            unselectedMarker,
            tagInstagram;
        var nameClicked = $(event.target).text();
        //Loop through placeList to find marker that matches the name that was clicked
        for (i = 0; i < self.placeList().length; i++) {
            if (nameClicked === self.placeList()[i].name()) {
                selectedMarker = arrayOfMarkers[i]; //selectedMarker becomes the marker object corresponding to location clicked
                arrayOfMarkers[i].setIcon(selectedIcon);
                tagInstagram = self.placeList()[i].instagramTag();
                self.currentLocation(nameClicked);
            }
        } //end of loop through placeList

        //Changes color of clicked name in list
        $(event.target).css('color', selectedColor);
        //Display the infowindow for the clicked name
        google.maps.event.trigger(selectedMarker, 'click');

        //Load Instagram photos for this location in case user clicks Instagram button
        //self.loadInstagram(nameClicked);
    };
    //Instagram API
    self.closeInstagram = function() {
        $(".photos").css("visibility", instagramClosed);
        self.currentLocation(defaultName);
    };
    self.openInstagram = function() {
        $(".photos").css("visibility", instagramSelected);
    };
    self.getInstagram = function() {
        self.removePhotos();
        var tagName;
        var foundName = false; //instagram tagName is set to default
        for (var j = 0; j < places.length; j++) {

            if (self.currentLocation() == self.placeList()[j].name()) {
                tagName = self.placeList()[j].instagramTag();
                foundName = true;
                break;
            }
        }
        if (foundName === false) {
            tagName = defaultTag;
        }
        var accessToken = "fb2e77d.47a0479900504cb3ab4a1f626d174d2d";
        //get each instagram photo
        $.ajax({
            type: "GET",
            dataType: "jsonp",
            cache: false,
            url: "https://api.instagram.com/v1/tags/" + tagName + "/media/recent?access_token=" + accessToken + "&count=6",


        });

    };

    //Remove photos from photopanel, so new photos can take their place.
    self.removePhotos = function() {
        var instagramPhotos = document.getElementById("photos");
        while (instagramPhotos.hasChildNodes()) {
            instagramPhotos.removeChild(instagramPhotos.firstChild);
        }
    };

    //EXECUTE METHODS
    self.getInstagram();
    self.drawMap();

}; //end of viewModel

window.onload = loadScript;