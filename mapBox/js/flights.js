/* =================== Flight section ================= */
var default_layers = [];

function animate(point, route, u_id, counter, steps, point_id, layers_list, sources_list) {
    // Update point geometry to a new position based on counter denoting
    // the index to access the arc.
    point.features[0].geometry.coordinates = route.features[0].geometry.coordinates[counter];

    // Calculate the bearing to ensure the icon is rotated to match the route arc
    // The bearing is calculate between the current point and the next point, except
    // at the end of the arc use the previous point and the current point
    try {
        point.features[0].properties.bearing = turf.bearing(
            turf.point(route.features[0].geometry.coordinates[counter >= steps ? counter - 1 : counter]),
            turf.point(route.features[0].geometry.coordinates[counter >= steps ? counter : counter + 1])
        );
    }catch (e) {
        console.log(e);
    }

    // Update the source with this new data.
    map.getSource(point_id).setData(point);

    // Request the next frame of animation so long the end has not been reached.
    if (counter < steps) {
        requestAnimationFrame(function () {
            animate(point, route, u_id, counter, steps, point_id, layers_list, sources_list);
        });
    } else {
        // Clear all sources and layers
        console.log("Remove all layers and sources for flight");
        clear_layers(map, layers_list, default_layers);
        clear_sources(map, sources_list);
        return;
    }
    // Update size of the flight according to the path
    var comparator = Math.floor(route.features[0].geometry.coordinates.length / 2);
    var incrementer = (1 - FLIGHT_ICON_IMAGE_SIZE + 1.8) / comparator;
    var current_size = map.getLayoutProperty(point_id, 'icon-size');

    if (counter < comparator) {
        map.setLayoutProperty(point_id, 'icon-size', iconSize = current_size + incrementer);
    } else {
        map.setLayoutProperty(point_id, 'icon-size', iconSize = current_size - incrementer);

    }

    counter = counter + FLIGHT_ANIMATION_COUNTER_INCREMENT_VALUE;
}


async function add_flight(origin, destination, u_id, counter) {
    var point_id = 'point_flight' + u_id;
    var route_id = 'route_flight' + u_id;
    var start_id = 'start_flight' + u_id;
    var end_id = 'end_flight' + u_id;
    var steps = FLIGHT_ANIMATION_STEPS;
    var sources_list = [];
    var layers_list = [];

    var curved = giveCurved(origin, destination);

    // A simple line from origin to destination.
    var route = {
        "type": "FeatureCollection",
        "features": [{
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": [
                    origin,
                    destination
                ]
            }
        }]
    };

    var start_marker = {
        "type": "FeatureCollection",
        "features": [{
            "type": "Feature",
            "properties": {},
            "geometry": {
                "type": "Point",
                "coordinates": origin
            }
        }]
    };
    var end_marker = {
        "type": "FeatureCollection",
        "features": [{
            "type": "Feature",
            "properties": {},
            "geometry": {
                "type": "Point",
                "coordinates": destination
            }
        }]
    };

    // A single point that animates along the route.
    // Coordinates are initially set to origin.
    var point = {
        "type": "FeatureCollection",
        "features": [{
            "type": "Feature",
            "properties": {},
            "geometry": {
                "type": "Point",
                "coordinates": origin
            }
        }]
    };
    // Update the route with calculated new_path coordinates
    route.features[0].geometry.coordinates = curved.geometry.coordinates;

    map.addSource(route_id, {
        "type": "geojson",
        "data": route
    });
    sources_list.push(route_id);

    map.addLayer({
        "id": route_id,
        "source": route_id,
        "type": "line",
        "layout": {
            "line-cap": "round"
        },
        "paint": {
            "line-width": FLIGHT_ROUTE_LINE_WIDTH,
            "line-color": FLIGHT_ROUTE_LINE_COLOR
        }
    });
    layers_list.push(route_id);

    // Add start and end markers
    map.addSource(start_id, {
        "type": "geojson",
        "data": start_marker
    });
    sources_list.push(start_id);


    map.addLayer({
        "id": start_id,
        "source": start_id,
        "type": "symbol",
        "layout": {
            "icon-image": FLIGHT_MARKER_IMAGE_NAME,
            "icon-rotate": ["get", "bearing"],
            "icon-rotation-alignment": "map",
            "icon-size": FLIGHT_MARKER_IMAGE_SIZE,
            "icon-allow-overlap": true,
            "icon-ignore-placement": true
        }
    });
    layers_list.push(start_id);

    map.addSource(end_id, {
        "type": "geojson",
        "data": end_marker
    });
    sources_list.push(end_id);


    map.addLayer({
        "id": end_id,
        "source": end_id,
        "type": "symbol",
        "layout": {
            "icon-image": FLIGHT_MARKER_IMAGE_NAME,
            "icon-rotate": ["get", "bearing"],
            "icon-rotation-alignment": "map",
            "icon-size": FLIGHT_MARKER_IMAGE_SIZE,
            "icon-allow-overlap": true,
            "icon-ignore-placement": true
        }
    });
    layers_list.push(end_id);
    // Add flight marker
    map.addSource(point_id, {
        "type": "geojson",
        "data": point
    });
    sources_list.push(point_id);


    map.addLayer({
        "id": point_id,
        "source": point_id,
        "type": "symbol",
        "layout": {
            "icon-image": FLIGHT_ICON_IMAGE_NAME,
            "icon-rotate": ["get", "bearing"],
            "icon-rotation-alignment": "map",
            "icon-size": FLIGHT_ICON_IMAGE_SIZE,
            "icon-allow-overlap": true,
            "icon-ignore-placement": true
        }
    });
    layers_list.push(point_id);

    animate(point, route, u_id, counter, steps, point_id, layers_list, sources_list);

}

async function add_all_flights(){
    while (true) {
        var flight_data_length = map_data.flight_data && map_data.flight_data.length;
        if (flight_data_length > 0) {
            var args = getCurrentSecondKey();
            // console.log("Searching flights for: " + window.flight_counter);
            if (map_data.flight_data[window.flight_counter]) {
                var item = map_data.flight_data[window.flight_counter];
                // console.log("Flights found for: " + window.flight_counter + " with data: "+ item);
                for (var m = 0; m < item.features.length; m++) {
                    var mapping = item.features[m];
                    for (var n = 0; n < mapping.features.length; n++) {
                        var entities = mapping.features[n];

                        var new_source = entities.source_city.geometry.sourceairportcoordinates;
                        var new_destination = entities.destination_city.geometry.destinationairportcoordinates;
                        var u_id = 'flight_' + window.flight_counter + '_' + m + '_' + n;
                        if (should_skip_flight(map) == true){
                            console.log("Due to overload, Skipping flight with ID: " + u_id);
                            continue;
                        }
                        console.log("Add flight with ID: " + u_id);
                        add_flight(new_source, new_destination, u_id, 0);
                    }
                }
                window.flight_counter++
                await sleep(FLIGHT_RENDER_WAIT_DURATION_MS);
            }
            else {
                window.flight_counter = 0;
                console.log("No flight found for: " + args.start);
                await sleep(FLIGHT_RENDER_WAIT_DURATION_MS);
            }
        } else {
            window.flight_counter++
            // console.log("Flight data not set, checking again in 1 second...");
            await sleep(FLIGHT_DATA_NOT_SET_WAIT_DURATION_MS);
        }
    }
}

async function set_flights_data(layers) {
    default_layers = layers;
    map.loadImage('/static/img/Asset_plane_white.png', function (error, image) {
        if (error) throw error;
        map.addImage(FLIGHT_ICON_IMAGE_NAME, image);
    });
    // await reload_lob_data(FLIGHT_API_URL, 'flight_data');
    add_all_flights();
    while(true){
        await sleep(FLIGHT_API_CALL_DURATION_MS);
        // console.log("Clear flight data");
        map_data.flight_data = [];
        // await reload_lob_data(FLIGHT_API_URL, 'flight_data');
    }


}
