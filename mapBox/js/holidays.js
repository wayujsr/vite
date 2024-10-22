/* =================== Holiday section ================= */

var default_layers = [];

async function add_holiday(new_source, new_destination, u_id, pax) {
    var source_point = {
        "type": "FeatureCollection",
        "features": [{
            "type": "Feature",
            "properties": {},
            "geometry": {
                "type": "Point",
                "coordinates": new_source
            }
        }]
    };

    var dest_point = {
        "type": "FeatureCollection",
        "features": [{
            "type": "Feature",
            "properties": {},
            "geometry": {
                "type": "Point",
                "coordinates": new_destination
            }
        }]
    };

    var new_route = {
        "type": "FeatureCollection",
        "features": [{
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": [
                    new_source,
                    new_destination
                ]
            }
        }]
    };


    console.log(u_id);
    var source_id = 'source_holiday' + u_id;
    var dest_id = 'dest_holiday' + u_id;
    var point_source_id = 'point' + source_id;
    var point_dest_id = 'point' + dest_id;
    var route_id = 'route_holiday' + u_id;

    var layers_list = [];
    var sources_list = [];

    map.addSource(point_source_id, {
        "type": "geojson",
        "data": source_point
    });
    sources_list.push(point_source_id);
    var icon_image = 'holidays_single_pax';
    if (pax == 1){
        icon_image = 'holidays_single_pax';
    }
    else if(pax == 2){
        icon_image = 'holidays_two_pax';
    }
    else{
        icon_image = 'holidays_family_pax';
    }

    map.addSource(point_dest_id, {
        "type": "geojson",
        "data": dest_point
    });
    map.addLayer({
        "id": point_dest_id,
        'type': 'symbol',
        'source': point_dest_id,
        "layout": {
            'icon-image': 'pulsing-dot'
        }
    });
    layers_list.push(point_dest_id);
    // await sleep(HOLIDAY_LAYER_ITEM_WAIT_DURATION_MS);
    map.addLayer({
        "id": point_source_id,
        "source": point_source_id,
        "type": "symbol",
        "layout": {
            "icon-image": HOLIDAY_ICON_IMAGE_NAME,
            "icon-size": HOLIDAY_ICON_IMAGE_SIZE,
            "icon-rotate": ["get", "bearing"],
            "icon-rotation-alignment": "map",
            "icon-allow-overlap": true,
            "icon-ignore-placement": true,
            "icon-offset": HOLIDAY_USER_ICON_IMAGE_OFFSET
        }
    });
    layers_list.push(point_source_id);
    // map.addSource(point_dest_id, {
    //     "type": "geojson",
    //     "data": dest_point
    // });
    sources_list.push(point_dest_id);
    // map.addLayer({
    //     "id": point_dest_id,
    //     "source": point_dest_id,
    //     "type": "symbol",
    //     "layout": {
    //         "icon-image": HOLIDAY_ICON_IMAGE_NAME,
    //         "icon-size": HOLIDAY_ICON_IMAGE_SIZE,
    //         "icon-rotate": ["get", "bearing"],
    //         "icon-rotation-alignment": "map",
    //         "icon-allow-overlap": true,
    //         "icon-ignore-placement": true,
    //         "icon-offset": HOLIDAY_ICON_IMAGE_OFFSET
    //     }
    // });
    await sleep(HOLIDAY_LAYER_ITEM_WAIT_DURATION_MS);

    // map.addSource(route_id, {
    //     "type": "geojson",
    //     "data": new_route
    // });
    sources_list.push(route_id);

    // map.addLayer({
    //     "id": route_id,
    //     "source": route_id,
    //     "type": "line",
    //     "paint": {
    //         "line-width": HOLIDAY_ROUTE_LINE_WIDTH,
    //         "line-color": HOLIDAY_ROUTE_LINE_COLOR,
    //         "line-dasharray": HOLIDAY_ROUTE_LINE_DASH
    //     }
    // });
    // layers_list.push(route_id);
    console.log("Remove all layers and sources for holidays");
    await sleep(HOLIDAY_CLEAR_LAYER_WAIT_DURATION_MS);
    clear_layers(map, layers_list, default_layers);
    clear_sources(map, sources_list);


}

async function add_all_holidays() {
    while (true) {
        var holiday_data_length = map_data.holiday_data && map_data.holiday_data.length;
        if (holiday_data_length > 0) {
            var args = getCurrentSecondKey();
            console.log("Searching holidays for: " + window.holiday_counter, window.holiday_data);
            if (map_data.holiday_data && map_data.holiday_data[window.holiday_counter]) {
                var item = map_data.holiday_data[window.holiday_counter];
                // console.log("Holidays found for: " + window.holiday_counter + " with data: "+ item);
                for (var m = 0; m < item.features.length; m++) {
                    var mapping = item.features[m];
                    for (var n = 0; n < mapping.features.length; n++) {
                        var entities = mapping.features[n];

                        var new_source = entities.destination_city.geometry.destinationholidaycoordinates;
                        var new_destination = entities.destination_city.geometry.destinationholidaycoordinates;
                        var pax = 1;

                        var u_id = 'holiday_' +  window.holiday_counter + '_' + m + '_' + n;
                        console.log("Add holidays with ID: " + u_id);
                        add_holiday(new_source, new_destination, u_id, pax);
                    }
                }
                window.holiday_counter++
                await sleep(HOLIDAY_RENDER_WAIT_DURATION_MS);
            }else {
                window.holiday_counter = 0
                console.log("No holidays found for: " + args.start);
                await sleep(HOLIDAY_NOT_FOUND_WAIT_DURATION_MS);
            }
        } else{
            window.holiday_counter = 0
            console.log("Holiday data not set, checking again...");
            await sleep(HOLIDAY_DATA_NOT_SET_WAIT_DURATION_MS);
        }
    }
}

async function set_holidays_data(layers){
    map.addImage('pulsing-dot', pulsingDot, { pixelRatio: 2 });
    map.loadImage('/static/img/Holidays.png', function (error, image) {
        if (error) throw error;
        map.addImage(HOLIDAY_ICON_IMAGE_NAME, image);
    });
    default_layers = layers;
    // await reload_lob_data(HOLIDAY_API_URL, 'holiday_data');
    add_all_holidays();
    while(true){
        await sleep(HOLIDAY_API_CALL_DURATION_MS);
        // console.log("Clear holiday data");
        map_data.holiday_data = [];
        // await reload_lob_data(HOLIDAY_API_URL, 'holiday_data');
    }


}
