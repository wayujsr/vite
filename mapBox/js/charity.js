/* =================== Charity section ================= */

var default_layers = [];

async function add_charity(new_source, u_id) {
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

    var source_id = 'source_charity' + u_id;
    var point_source_id = 'point' + source_id;
    var wave_id = 'wave_charity_' + u_id;

    var layers_list = [];
    var sources_list = [];

    map.addSource(point_source_id, {
        "type": "geojson",
        "data": source_point
    });
    sources_list.push(point_source_id);

    map.addLayer({
        "id": wave_id,
        "type": "heatmap",
        "source": point_source_id,
        "paint": {
            "heatmap-color": [
                "interpolate",
                ["linear"],
                ["heatmap-density"],
                0, "rgba(33,102,172,0)",
                0.2, "rgb(103,169,207)",
                0.4, "rgb(209,229,240)",
                0.6, "rgb(253,219,199)",
                0.8, "rgb(239,138,98)",
                1, "rgb(178,24,43)"
            ],
            // Adjust the heatmap radius
            "heatmap-radius": CHARITY_WAVE_RADIUS,
            "heatmap-opacity": CHARITY_WAVE_OPACITY
        }
    });
    layers_list.push(wave_id);

    map.addLayer({
        "id": point_source_id,
        "source": point_source_id,
        "type": "symbol",
        "layout": {
            "icon-image": CHARITY_ICON_IMAGE_NAME,
            "icon-rotate": ["get", "bearing"],
            "icon-rotation-alignment": "map",
            "icon-allow-overlap": true,
            "icon-ignore-placement": true,
        }
    });

    layers_list.push(point_source_id);

    await animate_wave(map, wave_id);
    console.log("Remove all layers and sources for charity");
    await sleep(CHARITY_CLEAR_LAYER_WAIT_DURATION_MS);
    clear_layers(map, layers_list, default_layers);
    clear_sources(map, sources_list);


}

async function add_all_charities() {
    while (true) {
        // console.log("Adding charities with data: " + map_data.charity_data);
        var charity_data_length = map_data.charity_data.length;
        if (charity_data_length > 0) {
            var args = getCurrentSecondKey();
            console.log("Searching charities for: " + window.charity_counter);
            if (map_data.charity_data[window.charity_counter]) {
                var item = map_data.charity_data[window.charity_counter];
                console.log("Charities found for: " + window.charity_counter + " with data: "+ item);
                for (var m = 0; m < item.features.length; m++) {
                    var mapping = item.features[m];
                    for (var n = 0; n < mapping.features.length; n++) {
                        var entities = mapping.features[n];

                        var new_source = entities.source_city.geometry.sourceairportcoordinates;

                        var u_id = 'charity_' + window.charity_counter + '_' + m + '_' + n;
                        if (should_skip_charity(map) == true){
                            console.log("Due to overload, Skipping charity with ID: " + u_id);
                            continue;
                        }
                        console.log("Add charities with ID: " + u_id);
                        add_charity(new_source, u_id);
                    }
                }
                window.charity_counter++
                await sleep(CHARITY_RENDER_WAIT_DURATION_MS);
            }
            else {
                window.charity_counter = 0;
                console.log("No charities found for: " + args.start);
                await sleep(CHARITY_NOT_FOUND_WAIT_DURATION_MS);
            }
        } else{
            window.charity_counter++
            console.log("Charity data not set, checking again...");
            await sleep(CHARITY_DATA_NOT_SET_WAIT_DURATION_MS);
        }
    }
}

async function set_charities_data(layers){
    default_layers = layers;
    // await reload_lob_data(CHARITY_API_URL, 'charity_data');
    // add_all_charities();
    while(true){
        await sleep(CHARITY_API_CALL_DURATION_MS);
        // console.log("Clear charity data");
        map_data.charity_data = [];
        // await reload_lob_data(CHARITY_API_URL, 'charity_data');
    }


}
