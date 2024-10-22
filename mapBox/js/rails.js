/* =================== Rail section ================= */
var default_layers = [];

function animatebus(point, route, u_id, counter, steps, point_id, layers_list, sources_list) {
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
    if (counter < steps - 1) {
        requestAnimationFrame(function () {
            animatebus(point, route, u_id, counter, steps, point_id, layers_list, sources_list);
        });
    } else {
        // Clear all sources and layers
        console.log("Remove all layers and sources for rails");
        clear_layers(map, layers_list, default_layers);
        clear_sources(map, sources_list);
        return;
    }
    counter = counter + RAIL_ANIMATION_COUNTER_INCREMENT_VALUE;
}


async function add_rail(origin, destination, u_id, counter) {
    var point_id = 'point_rail_' + u_id;
    var route_id = 'route_rail_' + u_id;
    var start_id = 'start_rail_' + u_id;
    var end_id = 'end_rail_' + u_id;
    var steps = RAIL_ANIMATION_STEPS;
    var sources_list = [];
    var layers_list = [];

    var curved = giveStraight(origin, destination, RAIL_ANIMATION_STEPS);

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
            "line-width": RAIL_ROUTE_LINE_WIDTH,
            "line-color": RAIL_ROUTE_LINE_COLOR,
            "line-dasharray": HOTEL_ROUTE_LINE_DASH
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
            "icon-image": "image",
            "icon-rotate": ["get", "bearing"],
            "icon-rotation-alignment": "map",
            "icon-size": RAIL_MARKER_IMAGE_SIZE,
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
            "icon-image": "image",
            "icon-rotate": ["get", "bearing"],
            "icon-rotation-alignment": "map",
            "icon-size": RAIL_MARKER_IMAGE_SIZE,
            "icon-allow-overlap": true,
            "icon-ignore-placement": true
        }
    });
    layers_list.push(end_id);
    // Add Rail marker
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
            "icon-image": RAIL_ICON_IMAGE_NAME,
            "icon-rotate": ["get", "bearing"],
            "icon-rotation-alignment": "map",
            "icon-size": RAIL_ICON_IMAGE_SIZE,
            "icon-allow-overlap": true,
            "icon-ignore-placement": true
        }
    });
    layers_list.push(point_id);

    animatebus(point, route, u_id, counter, steps, point_id, layers_list, sources_list);

}

async function add_all_rails(){
    while (true) {
        var rail_data_length = map_data.rail_data && map_data.rail_data.length;
        if (rail_data_length > 0) {
            var args = getCurrentSecondKey();
            if (map_data.rail_data[window.rail_counter]) {
                var item = map_data.rail_data[window.rail_counter];
                // console.log("rails found for: " + window.rail_counter + " with data: "+ item);
                for (var m = 0; m < item.features.length; m++) {
                    var mapping = item.features[m];
                    for (var n = 0; n < mapping.features.length; n++) {
                        var entities = mapping.features[n];

                        var new_source = entities.source_city.geometry.sourceairportcoordinates;
                        var new_destination = entities.destination_city.geometry.destinationairportcoordinates;
                        var u_id = 'rail_' + window.rail_counter + '_' + m + '_' + n;
                        if (should_skip_rail(map) == true){
                            console.log("Due to overload, Skipping rail with ID: " + u_id);
                            continue;
                        }
                        console.log("Add rail with ID: " + u_id);
                        add_rail(new_source, new_destination, u_id, 0);
                    }
                }
                window.rail_counter++
                await sleep(RAIL_RENDER_WAIT_DURATION_MS);
            }
            else {
                window.rail_counter = 0;
                console.log("No rail found for: " + args.start);
                await sleep(RAIL_RENDER_WAIT_DURATION_MS);
            }
        } else {
            window.rail_counter++
            // console.log("Rail data not set, checking again in 1 second...");
            await sleep(RAIL_DATA_NOT_SET_WAIT_DURATION_MS);
        }
    }
}

async function set_rails_data(layers) {
    default_layers = layers;
    // await reload_lob_data(RAIL_API_URL, 'rail_data');
    add_all_rails();
    while(true){
        await sleep(RAIL_API_CALL_DURATION_MS);
        // console.log("Clear Rail data");
        map_data.rail_data = [];
        // await reload_lob_data(RAIL_API_URL, 'rail_data');
    }


}
