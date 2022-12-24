"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startAsync = exports.getVesselCurrentStatus = void 0;
const axios_1 = __importDefault(require("axios"));
const types_1 = require("./types");
const env_1 = require("./env");
const schedule_1 = require("./schedule");
const consts_1 = require("./consts");
const haversine_distance_1 = __importDefault(require("haversine-distance"));
const util_1 = require("./util");
const VESSELS_BASE_URI = "https://www.wsdot.wa.gov/ferries/api/vessels/rest";
let cachedVesselStatus;
const REFRESH_INTERVAL_MS = 15 * 1000;
function getVesselCurrentStatus() {
    return cachedVesselStatus;
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
function cacheAndReturnStatus(status) {
    console.log(JSON.stringify(status));
    cachedVesselStatus = status;
    return {
        status: 200,
        data: status,
    };
}
async function refreshVesselStatusAsync() {
    try {
        const now = Date.now();
        // Get today's schedule of departures from edmonds to kingston
        const getSchedule = await (0, schedule_1.getScheduleAsync)();
        if (getSchedule.status !== 200)
            return {
                status: 404,
                statusText: "Failed to get ferry schedule",
            };
        const schedule = getSchedule.data;
        // Grab all the vessels on the route today
        const departureTimes = schedule.TerminalCombos[0].Times;
        const vesselIdSet = new Set();
        departureTimes.forEach((dep) => vesselIdSet.add(dep.VesselID));
        const vessels = [];
        // Get vessel current locations
        for (const vesselId of vesselIdSet) {
            const getVessel = await getVesselLocationAsync(vesselId);
            if (getVessel.status !== 200)
                return {
                    status: 404,
                    statusText: "Failed to get vessel location",
                };
            const vessel = getVessel.data;
            vessels.push(vessel);
        }
        // Get the distance between the terminals
        const distBetweenTerminals = (0, consts_1.DISTANCE_BETWEEN_TERMINALS)();
        // Is there a vehicle docked in kingston?
        const dockedInKingston = vessels.find((vessel) => vessel.AtDock &&
            vessel.DepartingTerminalID === consts_1.KINGSTON_TERMINAL_ID &&
            vessel.ScheduledDeparture);
        if (dockedInKingston) {
            // Get minutes until scheduled time of departure
            const stdMins = Math.ceil((dockedInKingston.ScheduledDeparture.getTime() - now) /
                1000 /
                60);
            const status = {
                disposition: "docked-in-kingston",
                name: dockedInKingston.VesselName,
                stdMins,
            };
            return cacheAndReturnStatus(status);
            // END
        }
        // Is there a vessel travelling to kingston?
        const travelingToKingston = vessels.find((vessel) => !vessel.AtDock &&
            vessel.DepartingTerminalID === consts_1.EDMONDS_TERMINAL_ID &&
            vessel.ArrivingTerminalID === consts_1.KINGSTON_TERMINAL_ID &&
            (vessel.LeftDock || vessel.LeftDock === null));
        if (travelingToKingston) {
            // Get the normalized distance travelled. 0 = at kingston, 1 = at edmonds
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
            const status = {
                disposition: "traveling-to-kingston",
                name: travelingToKingston.VesselName,
                etaMins,
                distPct,
            };
            return cacheAndReturnStatus(status);
            // END
        }
        // Is there a vessel docked in edmonds, yet to depart for kingston?
        const dockedInEdmonds = vessels.find((vessel) => vessel.AtDock &&
            vessel.DepartingTerminalID === consts_1.EDMONDS_TERMINAL_ID &&
            vessel.ScheduledDeparture);
        if (dockedInEdmonds) {
            // Get minutes until scheduled time of departure
            const stdMins = Math.ceil((dockedInEdmonds.ScheduledDeparture.getTime() - now) / 1000 / 60);
            const status = {
                disposition: "docked-in-edmonds",
                name: dockedInEdmonds.VesselName,
                stdMins,
            };
            return cacheAndReturnStatus(status);
            // END
        }
        // Fallback to a ferry travelling from kingston to edmonds (happens where there's only one boat).
        const travelingToEdmonds = vessels.find((vessel) => !vessel.AtDock &&
            vessel.DepartingTerminalID === consts_1.KINGSTON_TERMINAL_ID &&
            vessel.ArrivingTerminalID === consts_1.EDMONDS_TERMINAL_ID &&
            (vessel.LeftDock || vessel.LeftDock === null));
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
            const status = {
                disposition: "traveling-to-edmonds",
                name: travelingToEdmonds.VesselName,
                etaMins,
                distPct,
            };
            return cacheAndReturnStatus(status);
            // END
        }
        // No ferries running right now apparently.
        {
            const status = {
                disposition: "no-vessels-in-service",
            };
            return cacheAndReturnStatus(status);
        }
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