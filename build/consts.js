"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DISTANCE_BETWEEN_TERMINALS = exports.EDMONDS_TERMINAL_LATLON = exports.KINGSTON_TERMINAL_LATLON = exports.ED_KING_SCHED_ROUTE_ABBREV = exports.ED_KING_SCHED_ROUTE_ID = exports.ED_KING_SCHEDULE_ID = exports.ED_KING_ROUTE_ID = exports.EDMONDS_TERMINAL_ID = exports.KINGSTON_TERMINAL_ID = exports.EDMONDS_TERMINAL_NAME = exports.KINGSTON_TERMINAL_NAME = void 0;
const haversine_distance_1 = __importDefault(require("haversine-distance"));
exports.KINGSTON_TERMINAL_NAME = "Kingston";
exports.EDMONDS_TERMINAL_NAME = "Edmonds";
exports.KINGSTON_TERMINAL_ID = 12;
exports.EDMONDS_TERMINAL_ID = 8;
exports.ED_KING_ROUTE_ID = 6;
exports.ED_KING_SCHEDULE_ID = 182;
exports.ED_KING_SCHED_ROUTE_ID = 2116;
exports.ED_KING_SCHED_ROUTE_ABBREV = "ed-king";
exports.KINGSTON_TERMINAL_LATLON = {
    lat: 47.813498,
    lon: -122.385828,
};
exports.EDMONDS_TERMINAL_LATLON = {
    lat: 47.794862,
    lon: -122.494273,
};
let distBetweenTerminals = 0;
const DISTANCE_BETWEEN_TERMINALS = () => {
    if (!distBetweenTerminals)
        distBetweenTerminals = (0, haversine_distance_1.default)(exports.EDMONDS_TERMINAL_LATLON, exports.KINGSTON_TERMINAL_LATLON);
    return distBetweenTerminals;
};
exports.DISTANCE_BETWEEN_TERMINALS = DISTANCE_BETWEEN_TERMINALS;
//# sourceMappingURL=consts.js.map