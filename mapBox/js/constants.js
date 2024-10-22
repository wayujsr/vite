// const LOB_FLIGHT_DATA_NAME = 'flight_data';
// const LOB_HOTEL_DATA_NAME = 'hotel_data';
// const LOB_HOLIDAYS_DATA_NAME = 'holiday_data';
// const LOB_CHARITY_DATA_NAME = 'charity_data';
// const LOB_BUS_DATA_NAME = 'bus_data';
// const LOB_REDBUS_DATA_NAME = 'redbus_data';
const APP_CONFIGURATION_API_URL = '/configurations/';
const MAP_REFRESH_DURATION_MS = 8*60*1000; //  30 minutes
// MAP_REFRESH_DURATION_MS = get_constant('MAP_REFRESH_DURATION_MS', 5 * 60 * 1000);

const LOB_ITEM_SKIP_LAYER_COUNT = 40;
const MAP_API_DATA_WINDOW_DURATION_MS = 10 * 60 * 1000;
const MAP_WAVE_STEP_COUNT = 300;
const MAP_WAVE_MAX_RADIUS = 40;
const MAP_WAVE_MIN_RADIUS = 10;
const MAP_WAVE_DECREMENT_VALUE = 1;
const MAP_WAVE_STEP_WAIT_DURATION_MS = 3;


/*==================== Hotels ==================== */
// var data = require('../config/hotel_data.json');
// console.log(data);

const HOTEL_ICON_IMAGE_NAME = 'hotel_icon';
const HOTEL_ICON_IMAGE_SIZE = 0.4;
const HOTEL_ICON_IMAGE_OFFSET = [0, -20];
const HOTEL_USER_ICON_IMAGE_OFFSET = [0, -10];
const HOTEL_API_CALL_DURATION_MS = 9 * 60 * 1000;
const HOTEL_API_URL = '/hotels/';
const HOTEL_RENDER_WAIT_DURATION_MS = 1000;
const HOTEL_NOT_FOUND_WAIT_DURATION_MS = 1000;
const HOTEL_DATA_NOT_SET_WAIT_DURATION_MS = 1000;
const HOTEL_LAYER_ITEM_WAIT_DURATION_MS = 500;
const HOTEL_CLEAR_LAYER_WAIT_DURATION_MS = 2000;
const HOTEL_ROUTE_LINE_WIDTH = 2;
const HOTEL_ROUTE_LINE_COLOR = "#aa00bf";
const HOTEL_ROUTE_LINE_DASH = [2, 2];


/*==================== Flights ==================== */

const FLIGHT_ICON_IMAGE_NAME = 'Asset_plane_white';
const FLIGHT_ICON_IMAGE_SIZE = 0.45;
const FLIGHT_MARKER_IMAGE_NAME = 'flight_dot';
const FLIGHT_MARKER_IMAGE_SIZE = 0.2;
const FLIGHT_API_CALL_DURATION_MS = 9 * 60 * 1000;
const FLIGHT_API_URL = '/flights/';
const FLIGHT_RENDER_WAIT_DURATION_MS = 1000;
const FLIGHT_NOT_FOUND_WAIT_DURATION_MS = 1000;
const FLIGHT_DATA_NOT_SET_WAIT_DURATION_MS = 1000;
const FLIGHT_ANIMATION_STEPS = 500;
const FLIGHT_ANIMATION_COUNTER_INCREMENT_VALUE = 5;
const FLIGHT_ROUTE_LINE_WIDTH = 2;
const FLIGHT_ROUTE_LINE_COLOR = "#547ce7";
const FLIGHT_SKIP_LAYER_COUNT = 18;

/*==================== RAILS ==================== */

const RAIL_ICON_IMAGE_NAME = 'train_icon';
const CAB_ICON_IMAGE_NAME = 'cab_icon';
const RAIL_ICON_IMAGE_SIZE = .25;
const CAB_ICON_IMAGE_SIZE = .17;
const RAIL_MARKER_IMAGE_NAME = 'flight_dot';
const RAIL_MARKER_IMAGE_SIZE = 0.2;
const RAIL_API_CALL_DURATION_MS = 9 * 60 * 1000;
const RAIL_API_URL = '/rails/';
const RAIL_RENDER_WAIT_DURATION_MS = 1000;
const RAIL_NOT_FOUND_WAIT_DURATION_MS = 1000;
const RAIL_DATA_NOT_SET_WAIT_DURATION_MS = 1000;
const RAIL_ANIMATION_STEPS = 300;
const RAIL_ANIMATION_COUNTER_INCREMENT_VALUE = 5;
const RAIL_ROUTE_LINE_WIDTH = 2;
const RAIL_ROUTE_LINE_COLOR = "#f0e350";
const RAIL_SKIP_LAYER_COUNT = 16;

/*==================== BUS/RED-BUS ==================== */

// Common part
const BUS_ANIMATION_STEPS = 300;
const BUS_ICON_IMAGE_NAME = 'redBus_bus_icon';
const BUS_ICON_IMAGE_SIZE = 1;
const BUS_MARKER_IMAGE_NAME = 'red_bus_marker_dot';
const BUS_MARKER_IMAGE_SIZE = 0.2;
const BUS_ANIMATION_COUNTER_INCREMENT_VALUE = 5;
const BUS_ROUTE_LINE_WIDTH = 2;
const BUS_ROUTE_LINE_COLOR = "#f10000";
const BUS_SKIP_LAYER_COUNT = 20;

// Bus
const BUS_API_CALL_DURATION_MS = 9 * 60 * 1000;
const BUS_RENDER_WAIT_DURATION_MS = 1000;
const BUS_NOT_FOUND_WAIT_DURATION_MS = 1000;
const BUS_DATA_NOT_SET_WAIT_DURATION_MS = 1000;
const BUS_API_URL = '/buses/';

// Redbus
const REDBUS_API_CALL_DURATION_MS = 9 * 60 * 1000;
const REDBUS_RENDER_WAIT_DURATION_MS = 1000;
const REDBUS_NOT_FOUND_WAIT_DURATION_MS = 1000;
const REDBUS_DATA_NOT_SET_WAIT_DURATION_MS = 1000;
const REDBUS_API_URL = '/red-buses/';

/*==================== Holidays ==================== */

const HOLIDAY_ICON_IMAGE_NAME = 'holiday_icon';
const HOLIDAY_ICON_IMAGE_SIZE = 0.4;
const HOLIDAY_ICON_IMAGE_OFFSET = [0, -20];
const HOLIDAY_USER_ICON_IMAGE_OFFSET = [0, -10];
const HOLIDAY_API_CALL_DURATION_MS = 9 * 60 * 1000;
const HOLIDAY_API_URL = '/holidays/';
const HOLIDAY_RENDER_WAIT_DURATION_MS = 2000;
const HOLIDAY_NOT_FOUND_WAIT_DURATION_MS = 1000;
const HOLIDAY_DATA_NOT_SET_WAIT_DURATION_MS = 1000;
const HOLIDAY_LAYER_ITEM_WAIT_DURATION_MS = 500;
const HOLIDAY_CLEAR_LAYER_WAIT_DURATION_MS = 1000;
const HOLIDAY_ROUTE_LINE_WIDTH = 2;
const HOLIDAY_ROUTE_LINE_COLOR = "#eecc00";
const HOLIDAY_ROUTE_LINE_DASH = [2, 2];

/*==================== CHARITY ==================== */

const CHARITY_ICON_IMAGE_NAME = 'sapling';
const CHARITY_WAVE_RADIUS = 20;
const CHARITY_WAVE_OPACITY = 0.3;
const CHARITY_API_CALL_DURATION_MS = 9 * 60 * 1000;
const CHARITY_API_URL = '/charity/';
const CHARITY_RENDER_WAIT_DURATION_MS = 1000;
const CHARITY_NOT_FOUND_WAIT_DURATION_MS = 1000;
const CHARITY_DATA_NOT_SET_WAIT_DURATION_MS = 1000;
const CHARITY_CLEAR_LAYER_WAIT_DURATION_MS = 500;
const CHARITY_SKIP_LAYER_COUNT = 10;

function MAP_SHOW_FLIGHT(){
    return JSON.parse(get_constant('MAP_SHOW_FLIGHT', true));
}

function MAP_SHOW_HOTEL(){
    return JSON.parse(get_constant('MAP_SHOW_HOTEL', true));
}

function MAP_SHOW_BUS(){
    return JSON.parse(get_constant('MAP_SHOW_BUS', true));
}

function MAP_SHOW_REDBUS(){
    return JSON.parse(get_constant('MAP_SHOW_REDBUS', true));
}

function MAP_SHOW_HOLIDAY(){
    return JSON.parse(get_constant('MAP_SHOW_HOLIDAY', true));
}

function MAP_SHOW_CHARITY(){
    return JSON.parse(get_constant('MAP_SHOW_CHARITY', true));
}

function MAP_SHOW_FLIGHT(){
    return JSON.parse(get_constant('MAP_SHOW_FLIGHT', true));
}

const size = 350;
var pulsingDot = {
    width: size,
    height: size,
    data: new Uint8Array(size * size * 4),
    onAdd: function () {
        const canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        this.context = canvas.getContext('2d');
    },
    render: function () {
    const duration = 1000;
    const t = (performance.now() % duration) / duration;

    const radius = (size / 2) * 0.1;
    const outerRadius = (size / 2) * 0.7 * t + radius;
    const context = this.context;
    context.clearRect(0, 0, this.width, this.height);
    context.beginPath();
    context.arc(
        this.width / 2,
        this.height / 2,
        outerRadius,
        0,
        Math.PI * 2
    );
    context.fillStyle = `rgba(255, 255, 255, ${1 - t})`;
    context.fill();

    // Draw the inner circle.
    context.beginPath();
    context.arc(
    this.width / 2,
    this.height / 2,
    radius,
    0,
    Math.PI * 2
    );
    context.fillStyle = 'rgba(255, 255, 255, 1)';
    context.strokeStyle = 'white';
    context.lineWidth = 2 + 4 * (1 - t);
    context.fill();
    context.stroke();

    // Update this image's data with data from the canvas.
    this.data = context.getImageData( 0, 0, this.width,
    this.height
    ).data;

    // Continuously repaint the map, resulting
    // in the smooth animation of the dot.
    map.triggerRepaint();

    // Return `true` to let the map know that the image was updated.
    return true;
    }
};
