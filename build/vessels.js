"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startAsync = exports.getVesselsOnRouteAsync = exports.getVesselCurrentStatus = void 0;
const axios_1 = __importDefault(require("axios"));
const types_1 = require("./types");
const env_1 = require("./env");
const bulletins = __importStar(require("./bulletins"));
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
        .filter((ves) => !!ves.VesselName)
        .filter((ves) => ves.ArrivingTerminalID === consts_1.KINGSTON_TERMINAL_ID ||
        ves.DepartingTerminalID === consts_1.KINGSTON_TERMINAL_ID ||
        ves.ArrivingTerminalID === consts_1.EDMONDS_TERMINAL_ID ||
        ves.DepartingTerminalID === consts_1.EDMONDS_TERMINAL_ID);
    //vessels = testVessels as any;
    //console.log(JSON.stringify(vessels));
    for (const vessel of vessels) {
        (0, types_1.fixupVesselLocationFields)(vessel);
    }
    return {
        status: 200,
        data: vessels,
    };
}
exports.getVesselsOnRouteAsync = getVesselsOnRouteAsync;
async function refreshVesselStatusAsync() {
    var _a, _b, _c;
    try {
        const now = Date.now();
        // Fetch all active vessels on the route
        const getVesOnRoute = await getVesselsOnRouteAsync();
        const vessels = (_a = getVesOnRoute.data) !== null && _a !== void 0 ? _a : [];
        // Get the distance between the terminals
        const distBetweenTerminals = (0, consts_1.DISTANCE_BETWEEN_TERMINALS)();
        const bullsres = await bulletins.getBulletinsAsync();
        const bulls = ((_c = (_b = bullsres.data) === null || _b === void 0 ? void 0 : _b.edmonds) === null || _c === void 0 ? void 0 : _c.Bulletins) || [];
        const hasOutOfServiceAlert = (name) => {
            name = name.toLowerCase();
            for (let bull of bulls) {
                const lower = bull.BulletinText.toLowerCase();
                const texts = lower.split("<p>");
                for (const text of texts) {
                    if (/out of service/i.test(text) && !/elevator/i.test(text)) {
                        if (text.includes(name))
                            return true;
                    }
                }
            }
            return false;
        };
        const status = [];
        for (const vessel of vessels) {
            // Ensure vessel has a name
            if (!vessel.VesselName)
                continue;
            // Is the vessel out of service?
            if (hasOutOfServiceAlert(vessel.VesselName))
                continue;
            // Is the vessel docked in kingston?
            const isDockedInKingston = vessel.AtDock &&
                vessel.DepartingTerminalID === consts_1.KINGSTON_TERMINAL_ID;
            /*
                && (!!vessel.ArrivingTerminalID ||
                    !vessel.OpRouteAbbrev?.includes(
                        ED_KING_SCHED_ROUTE_ABBREV
                    ));
                */
            if (isDockedInKingston) {
                const st = {
                    order: 1,
                    disposition: "docked-in-kingston",
                    name: vessel.VesselName,
                };
                // Get minutes until scheduled time of departure
                if (vessel.ScheduledDeparture)
                    st.stdMins = Math.ceil((vessel.ScheduledDeparture.getTime() - now) / 1000 / 60);
                status.push(st);
                continue;
            }
            // Is the vessel traveling to kingston?
            let isTravelingToKingston = !vessel.AtDock &&
                vessel.DepartingTerminalID === consts_1.EDMONDS_TERMINAL_ID &&
                vessel.ArrivingTerminalID === consts_1.KINGSTON_TERMINAL_ID &&
                (!!vessel.LeftDock || vessel.LeftDock === null);
            if (!isTravelingToKingston)
                isTravelingToKingston =
                    !vessel.AtDock &&
                        vessel.DepartingTerminalID === consts_1.EDMONDS_TERMINAL_ID &&
                        (!!vessel.LeftDock || vessel.LeftDock === null);
            if (isTravelingToKingston) {
                // Get the normalized distance traveled. 0 = at kingston, 1 = at edmonds
                const vesselPos = {
                    lat: vessel.Latitude,
                    lon: vessel.Longitude,
                };
                const distToKingston = (0, haversine_distance_1.default)(vesselPos, consts_1.KINGSTON_TERMINAL_LATLON);
                const distPct = (0, util_1.clamp)(0, 1, Math.round(100 * (1 - distToKingston / distBetweenTerminals)) / 100);
                // Get minutes until estimated time of arrival
                const etaMins = vessel.Eta
                    ? Math.ceil((vessel.Eta.getTime() - now) / 1000 / 60)
                    : undefined;
                status.push({
                    order: 2,
                    disposition: "traveling-to-kingston",
                    name: vessel.VesselName,
                    etaMins,
                    distPct,
                });
                continue;
            }
            // Is the vessel docked in edmonds, yet to depart for kingston?
            const isDockedInEdmonds = vessel.AtDock &&
                vessel.DepartingTerminalID === consts_1.EDMONDS_TERMINAL_ID;
            /*
                && (!!vessel.ArrivingTerminalID ||
                    !vessel.OpRouteAbbrev?.includes(
                        ED_KING_SCHED_ROUTE_ABBREV
                    ));
                */
            if (isDockedInEdmonds) {
                const st = {
                    order: 3,
                    disposition: "docked-in-edmonds",
                    name: vessel.VesselName,
                };
                // Get minutes until scheduled time of departure
                if (vessel.ScheduledDeparture)
                    st.stdMins = Math.ceil((vessel.ScheduledDeparture.getTime() - now) / 1000 / 60);
                status.push(st);
                continue;
            }
            // Is the vessel traveling to edmonds?
            let isTravelingToEdmonds = !vessel.AtDock &&
                vessel.DepartingTerminalID === consts_1.KINGSTON_TERMINAL_ID &&
                vessel.ArrivingTerminalID === consts_1.EDMONDS_TERMINAL_ID &&
                (!!vessel.LeftDock || vessel.LeftDock === null);
            if (!isTravelingToEdmonds)
                isTravelingToEdmonds =
                    !vessel.AtDock &&
                        vessel.DepartingTerminalID === consts_1.KINGSTON_TERMINAL_ID &&
                        (!!vessel.LeftDock || vessel.LeftDock === null);
            if (isTravelingToEdmonds) {
                const vesselPos = {
                    lat: vessel.Latitude,
                    lon: vessel.Longitude,
                };
                const distToKingston = (0, haversine_distance_1.default)(vesselPos, consts_1.KINGSTON_TERMINAL_LATLON);
                const distPct = (0, util_1.clamp)(0, 1, Math.round(100 * (1 - distToKingston / distBetweenTerminals)) / 100);
                const etaMins = vessel.Eta
                    ? Math.ceil((vessel.Eta.getTime() - now) / 1000 / 60)
                    : undefined;
                status.push({
                    order: 4,
                    disposition: "traveling-to-edmonds",
                    name: vessel.VesselName,
                    etaMins,
                    distPct,
                });
                continue;
            }
        }
        status.sort((a, b) => {
            if (a.order === b.order) {
                if (a.etaMins !== undefined &&
                    b.etaMins !== undefined) {
                    return (parseFloat(a.etaMins) -
                        parseFloat(b.etaMins));
                }
                else if (a.etaMins !== undefined) {
                    return -1;
                }
                else if (b.etaMins !== undefined) {
                    return 1;
                }
                if (a.stdMins !== undefined &&
                    b.stdMins !== undefined) {
                    return (parseFloat(a.stdMins) -
                        parseFloat(b.stdMins));
                }
                else if (a.stdMins !== undefined) {
                    return -1;
                }
                else if (b.stdMins !== undefined) {
                    return 1;
                }
                return a.name.localeCompare(b.name);
            }
            return a.order - b.order;
        });
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