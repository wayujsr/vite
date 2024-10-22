/* =================== Hotel section ================= */
var default_layers = [];


async function add_hotel(new_source, new_destination, u_id, pax) {
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

    var source_id = 'source_hotel' + u_id;
    var dest_id = 'dest_hotel' + u_id;
    var point_source_id = 'point' + source_id;
    var bullet_source_id = 'bullet' + source_id;
    var point_dest_id = 'point' + dest_id;
    var route_id = 'route_hotel' + u_id;

    var layers_list = [];
    var sources_list = [];

    map.addSource(point_source_id, {
        "type": "geojson",
        "data": source_point
    });
    sources_list.push(point_source_id);
    var icon_image = 'single_pax';
    if (pax == 1){
        icon_image = 'single_pax';
    }
    else if(pax == 2){
        icon_image = 'two_pax';
    }
    else{
        icon_image = 'family_pax';
    }

    map.addLayer({
        "id": point_source_id,
        'type': 'symbol',
        'source': point_source_id,
        "layout": {
            'icon-image': 'pulsing-dot'
        }
    });

    // map.addLayer({
    //     "id": point_source_id,
    //     "source": point_source_id,
    //     "type": "symbol",
    //     "layout": {
    //         "icon-image": icon_image,
    //         "icon-rotate": ["get", "bearing"],
    //         "icon-rotation-alignment": "map",
    //         "icon-allow-overlap": true,
    //         "icon-ignore-placement": true,
    //     }
    // });
    layers_list.push(point_source_id);
    // await sleep(HOTEL_LAYER_ITEM_WAIT_DURATION_MS);

    map.addSource(point_dest_id, {
        "type": "geojson",
        "data": dest_point
    });
    sources_list.push(point_dest_id);
    map.addLayer({
        "id": point_dest_id,
        "source": point_dest_id,
        "type": "symbol",
        "layout": {
            "icon-image": HOTEL_ICON_IMAGE_NAME,
            "icon-size": HOTEL_ICON_IMAGE_SIZE,
            "icon-rotate": ["get", "bearing"],
            "icon-rotation-alignment": "map",
            "icon-allow-overlap": true,
            "icon-ignore-placement": true,
            "icon-offset": HOTEL_ICON_IMAGE_OFFSET
        }
    });
    layers_list.push(point_dest_id);
    await sleep(HOTEL_LAYER_ITEM_WAIT_DURATION_MS);

    map.addSource(route_id, {
        "type": "geojson",
        "data": new_route
    });
    sources_list.push(route_id);

    map.addLayer({
        "id": route_id,
        "source": route_id,
        "type": "line",
        "paint": {
            "line-width": HOTEL_ROUTE_LINE_WIDTH,
            "line-color": HOTEL_ROUTE_LINE_COLOR,
            "line-dasharray": HOTEL_ROUTE_LINE_DASH
        }
    });
    layers_list.push(route_id);
    console.log("Remove all layers and sources for hotels");
    await sleep(HOTEL_CLEAR_LAYER_WAIT_DURATION_MS);
    clear_layers(map, layers_list, default_layers);
    clear_sources(map, sources_list);


}

async function add_all_hotels() {
    while (true) {
        console.log("holte js ", map_data.hotel_data)
        var hotel_data_length = map_data.hotel_data && map_data.hotel_data.hotel_data.length;
        if (hotel_data_length > 0) {
            var args = getCurrentSecondKey();
            console.log("Searching hotels for: " + window.hotel_counter);
            if (map_data.hotel_data[window.hotel_counter]) {
                var item = map_data.hotel_data[window.hotel_counter];
                // console.log("Hotels found for: " + window.hotel_counter + "with data: "+ item);
                for (var m = 0; m < item.features.length; m++) {
                    var mapping = item.features[m];
                    for (var n = 0; n < mapping.features.length; n++) {
                        var entities = mapping.features[n];

                        var new_source = entities.destination_city.geometry.destinationusercoordinates;
                        var new_destination = entities.destination_city.geometry.destinationusercoordinates;
                        var u_id = 'hotel_' + window.hotel_counter + '_' + m + '_' + n;
                        var pax = entities.source_city.properties.adults;
                        console.log("Add hotels with ID: " + u_id);
                        add_hotel(new_source, new_destination, u_id, pax);
                    }
                }
                window.hotel_counter++
                await sleep(HOTEL_RENDER_WAIT_DURATION_MS);
            }
            else {
                window.hotel_counter = 0;
                console.log("No hotels found for: " + args.start);
                await sleep(HOTEL_NOT_FOUND_WAIT_DURATION_MS);
            }
        } else{
            window.hotel_counter = 0;
            console.log("Hotel data not set, checking again in 1 second...");
            await sleep(HOTEL_DATA_NOT_SET_WAIT_DURATION_MS);
        }
    }
}

async function set_hotels_data(layers){
    console.log("hotels data");
    console.log(window.hotel_data)
    map.addImage('pulsing-dot', pulsingDot, { pixelRatio: 2 });
    map.loadImage('/static/img/Hotel.png', function (error, image) {
        if (error) throw error;
        map.addImage(HOTEL_ICON_IMAGE_NAME, image);
    });
    map.loadImage('/static/img/train.png', function (error, image) {
        if (error) throw error;
        map.addImage(RAIL_ICON_IMAGE_NAME, image);
    });
    map.loadImage('/static/img/cab.png', function (error, image) {
        if (error) throw error;
        map.addImage(CAB_ICON_IMAGE_NAME, image);
    });
    default_layers = layers;

    map_data["rail_data"] = window.rail_data;
    map_data["flight_data"] = window.flight_data;
    map_data["bus_data"] = window.bus_data;
    map_data["hotel_data"] = window.hotel_data;
    map_data["cab_data"] = window.cab_data;
    map_data["holiday_data"] = window.holiday_data;
    console.log(map_data);
    try{
        let value = await reload_lob_data(HOTEL_API_URL, 'hotel_data');
        add_all_hotels();
    }catch(error){
        add_all_hotels();
    }
    while(true){
        await sleep(HOTEL_API_CALL_DURATION_MS);
        map_data["rail_data"] = JSON.parse(JSON.stringify(window.rail_data));
        map_data["flight_data"] = JSON.parse(JSON.stringify(window.flight_data));
        map_data["bus_data"] = JSON.parse(JSON.stringify(window.bus_data));
        map_data["hotel_data"] = JSON.parse(JSON.stringify(window.hotel_data));
        map_data["cab_data"] = JSON.parse(JSON.stringify(window.cab_data));
        map_data["holiday_data"] = JSON.parse(JSON.stringify(window.holiday_data));
        console.log("Clear hotel data");
        await reload_lob_data(HOTEL_API_URL, 'hotel_data');
    }
}