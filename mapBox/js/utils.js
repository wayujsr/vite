function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// function to clear the sources added to the map
function clear_sources(map, sources_list) {
    sources_list.forEach(function (source) {
        try {
            map.removeSource(source);
        } catch (e) {
            // console.log('Error: ' + e);
        }
    });
}

// function to clear the layers added to the map
function clear_layers(map, layers_list, default_layers) {
    layers_list.forEach(function (layer) {
        if (default_layers.indexOf(layer) == -1) {
            try {
                map.removeLayer(layer);
            } catch (e) {
                console.log('Error: ' + e);
            }
        }
    });
}

function reload_page() {
    console.log("Reload page...please wait...");
    location.href = "/geo_wall";
    window.location.reload();
}


async function refresh_map(map, default_layers) {
    while (true) {
        await sleep(MAP_REFRESH_DURATION_MS);
        window.hotel_counter = 0;
        window.flight_counter = 0;
        window.holiday_counter = 0;
        window.bus_counter = 0;
        window.charity_counter = 0;
        console.log("Refreshing map...please wait...");
        var layers = map.style._layers;
        var all_layers = Object.keys(layers);
        clear_layers(map, all_layers, default_layers);
        var refresh_button = document.getElementById("refresh_map");
        delete window.map;
        delete map_data;
        delete constants;
        refresh_button.click();
    }

}


function should_skip_item(map, defaul_layers) {
    var count = Object.keys(map.style._layers).length - defaul_layers.length;
    if (count > LOB_ITEM_SKIP_LAYER_COUNT) {
        return true;
    }
    return false;
}


function get_lob_layer_count(map, lob_name) {
    var current_layers = Object.keys(map.style._layers);
    var count = 0;
    current_layers.forEach(function (layer_name) {
        if (layer_name.includes(lob_name)) {
            count++;
        }
    });
    return count;
}


function should_skip_flight(map) {
    if (get_lob_layer_count(map, 'flight') > FLIGHT_SKIP_LAYER_COUNT) {
        return true;
    }
    return false;
}

function should_skip_rail(map) {
    if (get_lob_layer_count(map, 'rail') > RAIL_SKIP_LAYER_COUNT) {
        return true;
    }
    return false;
}

function should_skip_cab(map) {
    if (get_lob_layer_count(map, 'cab') > RAIL_SKIP_LAYER_COUNT) {
        return true;
    }
    return false;
}


function should_skip_bus(map) {
    if (get_lob_layer_count(map, 'bus') > BUS_SKIP_LAYER_COUNT) {
        return true;
    }
    return false;
}

function should_skip_charity(map) {
    if (get_lob_layer_count(map, 'charity') > CHARITY_SKIP_LAYER_COUNT) {
        return true;
    }
    return false;
}


function send_ajax_call(url, callback) {
    const http = new XMLHttpRequest();
    http.open("GET", url);
    http.setRequestHeader('Accept', 'application/json');
    http.responseType = 'json';
    http.send();
    http.onreadystatechange = (e) => {
        if (http.readyState === 4) {
            if (http.status === 200) {
                var raw_response = http.response;
                console.log(raw_response);
                if (raw_response) {
                    console.log("Return new map data");
                    var args = Array.prototype.slice.call(arguments, 3);
                    callback.apply(http, args);
                    return raw_response.map_data
                }
            }
        }
    }
}


//give curved line for plane to move on
function giveCurved(origin, destination) {
    var start = {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": origin
        }
    };
    var end = {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": destination
        }
    };
    var midpoint = turf.midpoint(start, end);

    //randomly generate angle for take off between 40 and 30 [Formula: Math.floor(Math.random() * ((y-x)+1) + x);
    var angle = Math.floor(Math.random() * (11) + 15);

    var m = (start.geometry.coordinates[1] - midpoint.geometry.coordinates[1]) / (start.geometry.coordinates[0] - midpoint.geometry.coordinates[0]);

    var angle_rad = Math.tan(angle * Math.PI / 180);
    var new_y = (angle_rad * (start.geometry.coordinates[0] - midpoint.geometry.coordinates[0])) + midpoint.geometry.coordinates[1];
    var new_x = midpoint.geometry.coordinates[0] - (m * (new_y - midpoint.geometry.coordinates[1]));
    // Create line with three point
    var line = {
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": [
                start.geometry.coordinates,
                [new_x, new_y],
                end.geometry.coordinates
            ]
        }
    };

    var curved = turf.bezier(line);
    curved.geometry.coordinates.push(end.geometry.coordinates);
    return curved;
}

function giveStraight(origin, destination, numberOfPoints) {
    var route = {
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": [
                origin,
                destination
            ]
        }
    };
    var lineDistance = turf.distance(origin, destination, { units: 'kilometers' });
    var arc = [];
    // Draw an arc between the `origin` & `destination` of the two points
    for (var i = 0; i < numberOfPoints; i++) {
        var segment = turf.along(route, (i * lineDistance) / numberOfPoints, { units: 'kilometers' });
        arc.push(segment.geometry.coordinates);
    }
    arc.push(destination);
    // Update the route with calculated arc coordinates
    route.geometry.coordinates = arc;
    return route;
}


function getCurrentSecondKey() {
    if (window.location.hash !== "#/geo_wall") { return false }
    // hours*minutes*seconds*milliseconds
    var oneDay = 24 * 60 * 60 * 1000;
    //got current second after removing milliseconds
    var current_second_key = Math.floor(new Date().getTime() / 1000) * 1000;

    var current_year = new Date().getFullYear();
    var current_month = new Date().getMonth();
    var current_day = new Date().getDate();

    var firstDate = new Date(2017, 4, 4); //month-1
    var secondDate = new Date(current_year, current_month, current_day);

    var day_difference = Math.round(Math.abs((firstDate.getTime() - secondDate.getTime()) / (oneDay)));

    current_second_key -= (day_difference * 86400000); //86400000 are the number of milliseconds in a day
    var end_second_key = current_second_key + MAP_API_DATA_WINDOW_DURATION_MS;
    // console.log(current_second_key, end_second_key);
    return {
        'start': current_second_key,
        'end': end_second_key
    };

}


async function animate_wave(map, wave_id) {
    var count = MAP_WAVE_STEP_COUNT;
    var max_radius = MAP_WAVE_MAX_RADIUS;
    var current_radius = map.getPaintProperty(wave_id, 'heatmap-radius');
    var incrementer = (max_radius - current_radius) / MAP_WAVE_MAX_RADIUS;
    while (count > 0) {
        if (Math.floor(count / 100) % 2 != 0 && current_radius > MAP_WAVE_MIN_RADIUS) {
            current_radius = current_radius - incrementer;
            map.setPaintProperty(wave_id, 'heatmap-radius', current_radius);
        } else if (current_radius < MAP_WAVE_MAX_RADIUS) {
            current_radius = current_radius + incrementer;
            map.setPaintProperty(wave_id, 'heatmap-radius', current_radius);
        }
        count = count - MAP_WAVE_DECREMENT_VALUE;
        await sleep(MAP_WAVE_STEP_WAIT_DURATION_MS);
    }
}

function reload_lob_data(lob_url, key) {
        console.log("Make ajax call to fetch data", key, map_data, window.hotel_data);
        var api_args = getCurrentSecondKey();
        // console.log(api_args)
        window.bus_counter = 0;
        window.hotel_counter = 0;
        window.flight_counter = 0;
        window.holiday_counter = 0;
        window.charity_counter = 0;
        window.cab_counter = 0;
        window.rail_counter = 0;
        
 
}


function get_constant(key, default_value) {
    console.log(constants, default_value);
    try {
        return constants.hasOwnProperty(key) ? constants[key] : default_value;
    }
    catch (e) {

        return default_value
    }
}
