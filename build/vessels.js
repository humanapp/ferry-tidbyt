"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startAsync = exports.getVesselCurrentStatus = void 0;
const axios_1 = __importDefault(require("axios"));
const types_1 = require("./types");
const env_1 = require("./env");
const consts_1 = require("./consts");
const haversine_distance_1 = __importDefault(require("haversine-distance"));
const util_1 = require("./util");
const VESSELS_BASE_URI = "https://www.wsdot.wa.gov/ferries/api/vessels/rest";
let cachedStatus;
const REFRESH_INTERVAL_MS = 15 * 1000;
function getVesselCurrentStatus() {
    return cachedStatus;
}
exports.getVesselCurrentStatus = getVesselCurrentStatus;
async function getVesselLocationAsync(vesselId) {
    const locres = await axios_1.default.get(`${VESSELS_BASE_URI}/vessellocations/${vesselId}?apiaccesscode=${(0, env_1.getSetting)("VESSELWATCH_APIKEY")}`);
    const vessel = locres.data;
    if (!vessel)
        return {
            status: 404,
        };
    (0, types_1.fixupVesselLocationFields)(vessel);
    return {
        status: 200,
        data: vessel,
    };
}
async function getVesselsOnRouteAsync() {
    const vesres = await axios_1.default.get(`${VESSELS_BASE_URI}/vessellocations?apiaccesscode=${(0, env_1.getSetting)("VESSELWATCH_APIKEY")}`);
    let vessels = vesres.data;
    if (!vessels) {
        return {
            status: 404,
        };
    }
    vessels = vessels
        .filter((ves) => ves.InService)
        .filter((ves) => ves.ArrivingTerminalID === consts_1.KINGSTON_TERMINAL_ID ||
        ves.DepartingTerminalID === consts_1.KINGSTON_TERMINAL_ID ||
        ves.ArrivingTerminalID === consts_1.EDMONDS_TERMINAL_ID ||
        ves.DepartingTerminalID === consts_1.EDMONDS_TERMINAL_ID);
    for (const vessel of vessels) {
        (0, types_1.fixupVesselLocationFields)(vessel);
    }
    return {
        status: 200,
        data: vessels,
    };
}
async function refreshVesselStatusAsync() {
    var _a;
    try {
        const now = Date.now();
        // Fetch all active vessels on the route
        const getVesOnRoute = await getVesselsOnRouteAsync();
        const vessels = (_a = getVesOnRoute.data) !== null && _a !== void 0 ? _a : [];
        // Get the distance between the terminals
        const distBetweenTerminals = (0, consts_1.DISTANCE_BETWEEN_TERMINALS)();
        const status = [];
        // Is there a vessel docked in kingston?
        const dockedInKingston = vessels.find((vessel) => vessel.VesselName &&
            vessel.AtDock &&
            vessel.DepartingTerminalID === consts_1.KINGSTON_TERMINAL_ID);
        if (dockedInKingston) {
            const st = {
                disposition: "docked-in-kingston",
                name: dockedInKingston.VesselName,
            };
            // Get minutes until scheduled time of departure
            if (dockedInKingston.ScheduledDeparture)
                st.stdMins = Math.ceil((dockedInKingston.ScheduledDeparture.getTime() - now) /
                    1000 /
                    60);
            status.push(st);
        }
        // Is there a vessel traveling to kingston?
        let travelingToKingston = vessels.find((vessel) => vessel.VesselName &&
            !vessel.AtDock &&
            vessel.DepartingTerminalID === consts_1.EDMONDS_TERMINAL_ID &&
            vessel.ArrivingTerminalID === consts_1.KINGSTON_TERMINAL_ID &&
            (!!vessel.LeftDock || vessel.LeftDock === null));
        if (!travelingToKingston)
            travelingToKingston = vessels.find((vessel) => vessel.VesselName &&
                !vessel.AtDock &&
                vessel.DepartingTerminalID === consts_1.EDMONDS_TERMINAL_ID &&
                (!!vessel.LeftDock || vessel.LeftDock === null));
        if (travelingToKingston) {
            // Get the normalized distance traveled. 0 = at kingston, 1 = at edmonds
            const vesselPos = {
                lat: travelingToKingston.Latitude,
                lon: travelingToKingston.Longitude,
            };
            const distToKingston = (0, haversine_distance_1.default)(vesselPos, consts_1.KINGSTON_TERMINAL_LATLON);
            const distPct = (0, util_1.clamp)(0, 1, Math.round(100 * (1 - distToKingston / distBetweenTerminals)) /
                100);
            // Get minutes until estimated time of arrival
            const etaMins = travelingToKingston.Eta
                ? Math.ceil((travelingToKingston.Eta.getTime() - now) / 1000 / 60)
                : undefined;
            status.push({
                disposition: "traveling-to-kingston",
                name: travelingToKingston.VesselName,
                etaMins,
                distPct,
            });
        }
        // Is there a vessel docked in edmonds, yet to depart for kingston?
        const dockedInEdmonds = vessels.find((vessel) => vessel.VesselName &&
            vessel.AtDock &&
            vessel.DepartingTerminalID === consts_1.EDMONDS_TERMINAL_ID);
        if (dockedInEdmonds) {
            const st = {
                disposition: "docked-in-edmonds",
                name: dockedInEdmonds.VesselName,
            };
            // Get minutes until scheduled time of departure
            if (dockedInEdmonds.ScheduledDeparture)
                st.stdMins = Math.ceil((dockedInEdmonds.ScheduledDeparture.getTime() - now) /
                    1000 /
                    60);
            status.push(st);
        }
        // Is there a vessel traveling to edmonds?
        let travelingToEdmonds = vessels.find((vessel) => vessel.VesselName &&
            !vessel.AtDock &&
            vessel.DepartingTerminalID === consts_1.KINGSTON_TERMINAL_ID &&
            vessel.ArrivingTerminalID === consts_1.EDMONDS_TERMINAL_ID &&
            (!!vessel.LeftDock || vessel.LeftDock === null));
        if (!travelingToEdmonds)
            travelingToEdmonds = vessels.find((vessel) => vessel.VesselName &&
                !vessel.AtDock &&
                vessel.DepartingTerminalID === consts_1.KINGSTON_TERMINAL_ID &&
                (!!vessel.LeftDock || vessel.LeftDock === null));
        if (travelingToEdmonds) {
            const vesselPos = {
                lat: travelingToEdmonds.Latitude,
                lon: travelingToEdmonds.Longitude,
            };
            const distToKingston = (0, haversine_distance_1.default)(vesselPos, consts_1.KINGSTON_TERMINAL_LATLON);
            const distPct = (0, util_1.clamp)(0, 1, Math.round(100 * (1 - distToKingston / distBetweenTerminals)) /
                100);
            const etaMins = travelingToEdmonds.Eta
                ? Math.ceil((travelingToEdmonds.Eta.getTime() - now) / 1000 / 60)
                : undefined;
            status.push({
                disposition: "traveling-to-edmonds",
                name: travelingToEdmonds.VesselName,
                etaMins,
                distPct,
            });
        }
        console.log(JSON.stringify(status));
        cachedStatus = status;
        return {
            status: 200,
            data: status,
        };
    }
    catch (err) {
        console.error(`Failed to get vessel status: ${err.toString()}`);
        return {
            status: 500,
            statusText: err.toString(),
        };
    }
    finally {
        setTimeout(async () => await refreshVesselStatusAsync(), REFRESH_INTERVAL_MS);
    }
}
async function startAsync() {
    await refreshVesselStatusAsync();
}
exports.startAsync = startAsync;
//# sourceMappingURL=vessels.js.map