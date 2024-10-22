var mainGeoWall = function (view_data, static_content) {
    let constants = view_data && view_data.constants;
    mapboxgl.accessToken =
        "pk.eyJ1IjoibW10NzQxMCIsImEiOiJjazQwenNxZm8wNnFzM2duOXBuZ3d0dGkyIn0.rg13qXfHPPZHVuEcjOq1Sw";
    var configs = view_data && view_data.configs;
    var map_configurations = {
        container: "map",
    };
    Object.assign(map_configurations, configs);
    map = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/mmt7410/cl06pnysa000014s0sl1yrxc5",
        center: [80.036, 22.941],
        zoom: 5.66,
        // hash: true
    });
    var map_data = view_data && view_data.map_data;

    var default_layers = [];
    map.on("load", () => {
        var layers = map.style._layers;
        default_layers = Object.keys(layers);
        // console.log(default_layers)
        set_hotels_data(default_layers);
        set_flights_data(default_layers);
        set_buses_data(default_layers);
        set_redbuses_data(default_layers);
        set_holidays_data(default_layers);
        set_cabs_data(default_layers);
        // set_charities_data(default_layers);
        set_rails_data(default_layers);
        refresh_map(map, default_layers);

    });
}
