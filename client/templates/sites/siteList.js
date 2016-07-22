Router.route("/map", {
    name: "siteList",
    loadingTemplate: "siteListLoading",
    data: function () {
        Meteor.subscribe("corporateEntity")
        return true;
    },
    waitOn: function () {
        console.log("Accediendo a la base de datos para listar sitios");
        //return Meteor.subscribe("corporateEntity");
    },
    onAfterAction: function () {
        Session.set("showHeader", false);
        Session.set("showFooter", false);
    }
});

function CenterControl(content, title, id, element, map, callback) 
{
    // Set CSS for the control border.
    var controlUI = document.createElement('div');
    controlUI.style.backgroundColor = '#fff';
    controlUI.style.border = '2px solid #fff';
    controlUI.style.borderRadius = '3px';
    controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
    controlUI.style.cursor = 'pointer';
    controlUI.style.margin = '10px';
    controlUI.style.textAlign = 'center';
    controlUI.title = title;
    element.appendChild(controlUI);

    // Set CSS for the control interior.
    var controlText = document.createElement('div');
    controlText.style.color = 'rgb(25,25,25)';
    controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
    controlText.style.fontSize = '26px';
    controlText.style.paddingLeft = '5px';
    controlText.style.paddingRight = '5px';
    controlText.id = id;
    controlText.innerHTML = content;
    controlUI.appendChild(controlText);

    controlUI.addEventListener('click', callback);
}

var markerCluster = false;
var TILE_SIZE = 256;

function project(latLng) 
{
    var siny = Math.sin(latLng.lat() * Math.PI / 180);

    // Truncating to 0.9999 effectively limits latitude to 89.189. This is
    // about a third of a tile past the edge of the world tile.
    siny = Math.min(Math.max(siny, -0.9999), 0.9999);

    return new google.maps.Point(
        TILE_SIZE * (0.5 + latLng.lng() / 360),
        TILE_SIZE * (0.5 - Math.log((1 + siny) / (1 - siny)) / (4 * Math.PI)));
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) 
{
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);  // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) 
{
    return deg * (Math.PI / 180)
}

var markers = {};
var mapInstance = undefined;
var points = [];

var initMarkers = function (markerList) 
{
    for (var i = 0; i < points.length; i++) {
        points[i].setMap(null);
    }
    if (markerList) {
        if (markerList.length > 0) {
            points = [];
            var centerMarker;
            var showIcon = valid(Router.current().params.query.showIcon) ? Router.current().params.query.showIcon : '0';
            markerList.forEach(function (item) {
                var marker;
                var icon = item.idFinancialEntity.isOriginalLogoAllowed ? 
                    item.idFinancialEntity.originalLogoPath : 
                    item.idFinancialEntity.alternateLogoPath;
                if (showIcon == '1') {
                    icon = item.idFinancialEntity.originalLogoPath;
                } else if (showIcon == '2') {
                    icon = item.idFinancialEntity.alternateLogoPath;
                }
                marker = new google.maps.Marker({
                    position: new google.maps.LatLng(item.location.coordinates[1], item.location.coordinates[0]),
                    //draggable: true,
                    //map: mapInstance.instance,
                    icon: icon
                });
                points.push(marker);
                //SE GUARDA EL MARCADOR EN UN ARREGLO PARA TENER SU REFERENCIA
                markers[item._id] = marker;
                markers[item._id].site = item;

                //CUANDO ARRASTRO UN CAJERO
                google.maps.event.addListener(marker, 'dragend', function (event) {
                    /*console.log("Actualicé: " + item._id);
                    console.log(event.latLng.lat());
                    console.log(event.latLng.lng());*/
                    site.update({ _id: item._id }, { $set: { "location.coordinates.1": event.latLng.lat(), "location.coordinates.0": event.latLng.lng() } });
                });
                
                //CUANDO PRESIONO UN CAJERO
                google.maps.event.addListener(marker, 'click', function (event) {
                    Session.set("selectedSite", item);
                    $("#showSite").modal("show");
                });
                centerMarker = marker;
            });
            if (markerCluster) {
                markerCluster.clearMarkers();
            }
            markerCluster = new MarkerClusterer(mapInstance.instance, points, {});
        }
    }
}

Template.siteList.onCreated(function () 
{
    if (!GoogleMaps.loaded()) {
        GoogleMaps.load({
            key: "AIzaSyC4j3ixRQEbQx2K2tzs4kjsg-FJFznFS1A"
        });
    }
});

function doSearch() 
{
    event.preventDefault();
    var search = $("#search").val();
    var filters = {};
    if (valid($("#financialEntity").val())) {
        if ($("#financialEntity").val().length > 0) {
            if (!($("#financialEntity").val().length == 1 && $("#financialEntity").val()[0] == "")) {
                filters.idFinancialEntity = {
                    $in: $("#financialEntity").val()
                }
            }
        }
    }
    if (search.length > 0) {
        filters["$or"] = [
            {
                address: { $regex: search, $options: "i" }
            },
            {
                status: { $regex: search, $options: "i" }
            },
            {
                reference: { $regex: search, $options: "i" }
            }
        ];
    }
    Meteor.call("siteListByFilters", filters, function (err, result) {
        if (!valid(err)) {
            initMarkers(result);
        }
    });
}

Template.siteList.events({
    "keyup #search": function (event, template) {
        doSearch();
    },
    "change #financialEntity": function (event, template) {
        doSearch();
    },
    "click #close-panel": function (event, template) {
        var windowHeight = parseInt($(window).height());
        var headerHeight = parseInt($(".header").height());
        var contentHeight = (windowHeight - headerHeight);
        $(".map-container").css("height", contentHeight + "px");
        $(".list-container").addClass("hide");
    },
    "click .marker": function (event, template) {
        var data = event.target.dataset;
        Session.set("selectedSite", {
            nameSpa: data.namespa,
            location: {
                coordinates: [
                    data.longitude,
                    data.latitude
                ],
                type: "Point"
            },
            address: data.address,
            idFinancialEntity: {
                nameSpa: data.financialentitynamespa,
                isOriginalLogoAllowed: data.financialentityoriginallogo
            },
            status: data.status,
            reference: data.reference,
            _id: data.id
        });
        $("#showSite").modal("show");
    }
});

var MAP_ZOOM = 15;
Template.siteList.helpers({
    mapOptions: function () {
        if (GoogleMaps.loaded()) {
            return {
                center: new google.maps.LatLng(4.71099, -74.07209),
                zoom: MAP_ZOOM
            };
        }
    },
    getSiteList: function () {
        Meteor.call("siteList", function (err, result) {
            if (!valid(err)) {
                Session.set("siteList", result);
            } else {
                Session.set("siteList", []);
            }
        });
    }
});

Template.siteList.onCreated(function () {
    var self = this;
    GoogleMaps.ready('map', function (map) {
        self.autorun(function () {
            if (!Session.get("siteList"))
                return;
            mapInstance = map;
            initMarkers(Session.get("siteList"));
        });
        var menuControlDiv = document.createElement('div');
        var menuControl = new CenterControl('<i style="vertical-align: middle;" class="glyphicon glyphicon-menu-hamburger"></i>', 'Menú', 'menuID', menuControlDiv, map, function () {
            if ($("#homeID").hasClass('hide')) {
                $("#homeID").removeClass('hide');
                $("#fullscreenID").removeClass('hide');
            } else {
                $("#homeID").addClass('hide');
                $("#fullscreenID").addClass('hide');
            }
        });
        var homeControlDiv = document.createElement('div');
        var homeControl = new CenterControl('<i style="vertical-align: middle;" class="glyphicon glyphicon-home"></i>', 'Inicio', 'homeID', homeControlDiv, map, function () {
            window.location.pathname = '/';
        });
        var fullscreenControlDiv = document.createElement('div');
        var fullscreenControl = new CenterControl('<i style="vertical-align: middle;" class="glyphicon glyphicon-fullscreen"></i>', 'Inicio', 'fullscreenID', fullscreenControlDiv, map, function (event) {
            screenfull.toggle();
        });

        menuControlDiv.index = 1;
        homeControlDiv.index = 1;
        map.instance.controls[google.maps.ControlPosition.LEFT_CENTER].push(menuControlDiv);
        map.instance.controls[google.maps.ControlPosition.LEFT_CENTER].push(homeControlDiv);
        if (screenfull.enabled) {
            map.instance.controls[google.maps.ControlPosition.LEFT_CENTER].push(fullscreenControlDiv);
        }
        Meteor.defer(function () {
            $(window).resize(function () {
                var windowHeight = parseInt($(window).height());
                var headerHeight = parseInt($(".header").height());
                var contentHeight = (windowHeight - headerHeight);
                $(".footer").remove();
                $(".map-container").css("height", contentHeight + "px");
            });
            $(window).resize();
        });
        interact('.list-container')
            .draggable({
                onmove: window.dragMoveListener
            })
            .resizable({
                preserveAspectRatio: false,
                edges: { left: false, right: false, bottom: false, top: true }
            })
            .on('resizemove', function (event) {
                var windowHeight = parseInt($(window).height());
                var headerHeight = parseInt($(".header").height());
                var contentHeight = (windowHeight - headerHeight);
                var target = event.target,
                    x = (parseFloat(target.getAttribute('data-x')) || 0),
                    y = (parseFloat(target.getAttribute('data-y')) || 0);
                
                // update the element's style
                target.style.width = event.rect.width + 'px';
                target.style.height = event.rect.height + 'px';

                // translate when resizing from top or left edges
                x += event.deltaRect.left;
                y += event.deltaRect.top;

                //target.style.webkitTransform = target.style.transform =
                'translate(' + x + 'px,' + y + 'px)';

                target.setAttribute('data-x', x);
                target.setAttribute('data-y', y);

            });
    });
});

/**
SHOW SITE MODAL
*/
Template.showSite.helpers({
    getSelectedSite: function () {
        if (valid(Session.get("selectedSite"))) {
            var site = Session.get("selectedSite");
            site.latitude = site.location.coordinates[1];
            site.longitude = site.location.coordinates[0];
            return site;
        }
        return undefined;
    },
    isOriginalLogoAllowed: function (isOriginalLogoAllowed) {
        return isOriginalLogoAllowed ? "Ya se aprobó el uso del logo original" : "No se ha aprobado el uso del logo original";
    }
});
