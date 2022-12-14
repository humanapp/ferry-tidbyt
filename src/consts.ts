import { LatLon } from "./types";
import haversineDistance from "haversine-distance";

export const KINGSTON_TERMINAL_ID = 12;
export const EDMONDS_TERMINAL_ID = 8;

export const KINGSTON_TERMINAL_LATLON: LatLon = {
    lat: 47.813498,
    lon: -122.385828,
};

export const EDMONDS_TERMINAL_LATLON: LatLon = {
    lat: 47.794862,
    lon: -122.494273,
};

let distBetweenTerminals: number = 0;

export const DISTANCE_BETWEEN_TERMINALS = () => {
    if (!distBetweenTerminals)
        distBetweenTerminals = haversineDistance(
            EDMONDS_TERMINAL_LATLON,
            KINGSTON_TERMINAL_LATLON
        );
    return distBetweenTerminals;
};
