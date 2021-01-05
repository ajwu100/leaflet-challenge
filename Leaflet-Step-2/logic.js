// Store our JSON API endpoint for all past 30 days earthquakes inside usgsUrl variable.
var usgsUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";
console.log(usgsUrl);


// Create a map object
var EQMap = L.map("map", {
    center: [20, 10],
    zoom: 2,
});

// Add a tile layer
var standard = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY,
}).addTo(EQMap);

var legend = L.control({ position: "bottomright" });

legend.onAdd = function (EQMap) {
    var div = L.DomUtil.create('div', "legend"),
        mag = ["0-1", "1-2", "2-3", "3-4", "4-5", "5+"],
        labels = ["green", "greenyellow", "yellow", "orange", "orangered", "red"];
    for (var i = 0; i < mag.length; i++) {
        div.innerHTML +=
            '<i style="background:' + labels[i] + '"></i> ' +
            mag[i] + '<br>'
    }
    return div;
};
legend.addTo(EQMap);

// Perform a GET request to the usgsUrl URL.
var EQLayer = d3.json(usgsUrl).then(function (data) {
    //console.log(data);
    var earthquakes = data.features;
    //console.log(earthquakes);

    // Loop through each earthquakes array.  
    earthquakes.forEach((earthquake) => {
        const coords = earthquake.geometry.coordinates;
        //console.log(coords);
        const lng = coords[0];
        const lat = coords[1];
        //console.log(lng);
        //console.log(lat);
        const lnglat = { lon: lng, lat: lat };
        //console.log(lnglat);

        // Color each earthquake by magnitude and link radius of each circle marker to magnitude.
        color = "red";
        if (earthquake.properties.mag < 1) {
            color = "green";
        } else if (earthquake.properties.mag > 1 && earthquake.properties.mag < 2) {
            color = "greenyellow";
        } else if (earthquake.properties.mag > 2 && earthquake.properties.mag < 3) {
            color = "yellow";
        } else if (earthquake.properties.mag > 3 && earthquake.properties.mag < 4) {
            color = "orange";
        } else if (earthquake.properties.mag > 4 && earthquake.properties.mag < 5) {
            color = "orangered";
        }
        // Add circles to map
        var circle = L.circle(lnglat, {
            fillOpacity: 0.6,
            color: "none",
            fillColor: color,
            radius: earthquake.properties.mag * 15000,
        }).bindPopup(
            `<h1>Place: ${earthquake.properties.place}</h1>
        <h2>Magnitude: ${earthquake.properties.mag}</h2>
        <h2>Tsunami: ${earthquake.properties.tsunami}</h2>
        `);
        circle.addTo(EQMap);
    });
});

// Store our JSON API endpoint for all past 30 days earthquakes inside usgsUrl variable.
var tectUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json";
console.log(tectUrl);
// Perform a GET request to the tectUrl URL.
var PlateLayer = d3.json(tectUrl).then(function (data2) {
    //console.log(data2);
    var plates = data2.features;
    console.log(plates);

    plates.forEach((plate) => {
        L.geoJson(plate, {
            color: "grey",
            weight: 1.5,
        }).bindPopup(`<h1>Plate Name: ${plate.properties.PlateName}</h1>`).addTo(EQMap);
    });
});

// Add the layer control to the map.  Could not get to work.

var baseMap = {
    Standard: standard,
};
var overlayMap = {
    TectonicPlates: PlateLayer,
    Earthquakes: EQLayer,
};

L.control.layers(baseMap, overlayMap).addTo(EQMap);