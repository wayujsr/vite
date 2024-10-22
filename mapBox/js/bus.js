        /* =================== Bus section ================= */
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
        console.log("Remove all layers and sources for bus");
        clear_layers(map, layers_list, default_layers);
        clear_sources(map, sources_list);
        return;
    }
    counter = counter + BUS_ANIMATION_COUNTER_INCREMENT_VALUE;
}


async function add_bus(origin, destination, u_id, counter) {
    var point_id = 'point_bus' + u_id;
    var route_id = 'route_bus' + u_id;
    var start_id = 'start_bus' + u_id;
    var end_id = 'end_bus' + u_id;
    var steps = BUS_ANIMATION_STEPS;
    var sources_list = [];
    var layers_list = [];

    var line = giveStraight(origin, destination, BUS_ANIMATION_STEPS);
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
    route.features[0].geometry.coordinates = line.geometry.coordinates;

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
            "line-width": BUS_ROUTE_LINE_WIDTH,
            "line-color": BUS_ROUTE_LINE_COLOR
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
            "icon-image": BUS_MARKER_IMAGE_NAME,
            "icon-rotate": ["get", "bearing"],
            "icon-rotation-alignment": "map",
            "icon-size": BUS_MARKER_IMAGE_SIZE,
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
            "icon-image": BUS_MARKER_IMAGE_NAME,
            "icon-rotate": ["get", "bearing"],
            "icon-rotation-alignment": "map",
            "icon-size": BUS_MARKER_IMAGE_SIZE,
            "icon-allow-overlap": true,
            "icon-ignore-placement": true
        }
    });
    layers_list.push(end_id);
    // Add bus marker
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
            "icon-image": BUS_ICON_IMAGE_NAME,
            "icon-rotate": ["get", "bearing"],
            "icon-rotation-alignment": "map",
            "icon-size": BUS_ICON_IMAGE_SIZE,
            "icon-allow-overlap": true,
            "icon-ignore-placement": true
        }
    });
    layers_list.push(point_id);

    animatebus(point, route, u_id, counter, steps, point_id, layers_list, sources_list);

}

async function add_all_buses(){
    while (true) {
        var bus_data_length = map_data.bus_data && map_data.bus_data.length;
        if (bus_data_length > 0) {
            var args = getCurrentSecondKey();
            // console.log("Searching buses for: " + map_data.bus_data[window.bus_counter]);
            if (map_data.bus_data[window.bus_counter]) {
                var item = map_data.bus_data[window.bus_counter];
                // console.log("Buses found for: " + window.bus_counter + "with data: "+ item);
                for (var m = 0; m < item.features.length; m++) {
                    var mapping = item.features[m];
                    for (var n = 0; n < mapping.features.length; n++) {
                        var entities = mapping.features[n];

                        var new_source = entities.source_city.geometry.sourcebuscoordinates;
                        var new_destination = entities.destination_city.geometry.destinationbuscoordinates;
                        var u_id = 'bus_' + window.bus_counter + '_' + m + '_' + n;
                        if (should_skip_bus(map) == true){
                            console.log("Due to overload, Skipping bus with ID: " + u_id);
                            continue;
                        }
                        console.log("Add bus with ID: " + u_id);
                        add_bus(new_source, new_destination, u_id, 0);
                    }
                }
                window.bus_counter++;
                await sleep(BUS_RENDER_WAIT_DURATION_MS);
            }
            else {
                window.bus_counter = 0;
                console.log("No bus found for: " + window.counter);
                await sleep(BUS_NOT_FOUND_WAIT_DURATION_MS);
            }
        } else {
            window.bus_counter++;
            // console.log("Bus data not set, checking again in 1 second...");
            await sleep(BUS_DATA_NOT_SET_WAIT_DURATION_MS);
        }
    }
}

async function add_all_redbuses(){
    while (true) {
        // console.log("Adding redbsuses with data: " + map_data.redbus_data);
        var redbus_data_length = Object.keys(map_data.redbus_data).length;
        if (redbus_data_length > 0) {
            var args = getCurrentSecondKey();
            console.log("Searching redbuses for: " + args.start);
            if (map_data.redbus_data.hasOwnProperty(args.start)) {
                var item = map_data.redbus_data[args.start];
                console.log("Redbuses found for: " + args.start + "with data: "+ item);
                for (var m = 0; m < item.features.length; m++) {
                    var mapping = item.features[m];
                    for (var n = 0; n < mapping.features.length; n++) {
                        var entities = mapping.features[n];

                        var new_source = entities.source_city.geometry.sourcebuscoordinates;
                        var new_destination = entities.destination_city.geometry.destinationbuscoordinates;
                        var u_id = 'red' + args.start + '_' + m + '_' + n;
                        if (should_skip_bus(map) == true){
                            console.log("Due to overload, Skipping redbus with ID: " + u_id);
                            continue;
                        }
                        console.log("Add redbus with ID: " + u_id);
                        add_bus(new_source, new_destination, u_id, 0);
                    }
                }
                await sleep(REDBUS_RENDER_WAIT_DURATION_MS);
            }
            else {
                console.log("No redbus found for: " + args.start);
                await sleep(REDBUS_NOT_FOUND_WAIT_DURATION_MS);
            }
        } else {
            console.log("Redbus data not set, checking again...");
            await sleep(REDBUS_DATA_NOT_SET_WAIT_DURATION_MS);
        }
    }
}

async function set_buses_data(layers) {
    default_layers = layers;
    // await reload_lob_data(BUS_API_URL, 'bus_data');
    map.loadImage('/static/img/redBus_bus_icon.png', function (error, image) {
        if (error) throw error;
        map.addImage(BUS_ICON_IMAGE_NAME, image);
    });
    add_all_buses();
    while(true){
        await sleep(BUS_API_CALL_DURATION_MS);
        // console.log("Clear bus data");
        map_data.bus_data = [];
        // await reload_lob_data(BUS_API_URL, 'bus_data');
    }


}

async function set_redbuses_data(layers) {
    default_layers = layers;
    // await reload_lob_data(REDBUS_API_URL, 'redbus_data');
    // add_all_redbuses();
    while(true){
        await sleep(REDBUS_API_CALL_DURATION_MS);
        // console.log("Clear redbus data");
        map_data.redbus_data = [];
        // await reload_lob_data(REDBUS_API_URL, 'redbus_data');
    }


}
