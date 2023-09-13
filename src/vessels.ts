import axios from "axios";
import {
    ServiceResult,
    VesselLocation,
    fixupVesselLocationFields,
    VesselStatus,
    LatLon,
    DockedInEdmonds,
    DockedInKingston,
    RouteStatus,
    WSDOTBulletin,
    WaitTimeVal,
} from "./types";
import { getSetting } from "./env";
import { getScheduleAsync } from "./schedule";
import * as bulletins from "./bulletins";
import {
    DISTANCE_BETWEEN_TERMINALS,
    EDMONDS_TERMINAL_ID,
    KINGSTON_TERMINAL_ID,
    KINGSTON_TERMINAL_LATLON,
    ED_KING_SCHED_ROUTE_ABBREV,
} from "./consts";
import haversineDistance from "haversine-distance";
import { clamp } from "./util";
import testVessels from "./testVessels.json";

const VESSELS_BASE_URI = "https://www.wsdot.wa.gov/ferries/api/vessels/rest";

let cachedStatus: VesselStatus[];
const REFRESH_INTERVAL_MS = 15 * 1000;

export function getVesselCurrentStatus(): VesselStatus[] | undefined {
    return cachedStatus;
}

async function getVesselLocationAsync(
    vesselId: number
): Promise<ServiceResult<VesselLocation>> {
    const locres = await axios.get(
        `${VESSELS_BASE_URI}/vessellocations/${vesselId}?apiaccesscode=${getSetting(
            "VESSELWATCH_APIKEY"
        )}`
    );

    const vessel = locres.data as VesselLocation;
    if (!vessel)
        return {
            status: 404,
        };

    fixupVesselLocationFields(vessel);

    return {
        status: 200,
        data: vessel,
    };
}

export async function getVesselsOnRouteAsync(): Promise<
    ServiceResult<VesselLocation[]>
> {
    const vesres = await axios.get(
        `${VESSELS_BASE_URI}/vessellocations?apiaccesscode=${getSetting(
            "VESSELWATCH_APIKEY"
        )}`
    );

    let vessels = vesres.data as VesselLocation[];
    if (!vessels) {
        return {
            status: 404,
        };
    }

    vessels = vessels
        .filter((ves) => ves.InService)
        .filter((ves) => !!ves.VesselName)
        .filter(
            (ves) =>
                ves.ArrivingTerminalID === KINGSTON_TERMINAL_ID ||
                ves.DepartingTerminalID === KINGSTON_TERMINAL_ID ||
                ves.ArrivingTerminalID === EDMONDS_TERMINAL_ID ||
                ves.DepartingTerminalID === EDMONDS_TERMINAL_ID
        );

    //vessels = testVessels as any;
    //console.log(JSON.stringify(vessels));

    for (const vessel of vessels) {
        fixupVesselLocationFields(vessel);
    }

    return {
        status: 200,
        data: vessels,
    };
}

async function refreshVesselStatusAsync(): Promise<
    ServiceResult<VesselStatus[]>
> {
    try {
        const now = Date.now();

        // Fetch all active vessels on the route
        const getVesOnRoute = await getVesselsOnRouteAsync();
        const vessels = getVesOnRoute.data ?? [];

        // Get the distance between the terminals
        const distBetweenTerminals = DISTANCE_BETWEEN_TERMINALS();

        const status: VesselStatus[] = [];

        for (const vessel of vessels) {
            // Is the vessel docked in kingston?
            const isDockedInKingston =
                vessel.AtDock &&
                vessel.DepartingTerminalID === KINGSTON_TERMINAL_ID;
            /*
                && (!!vessel.ArrivingTerminalID ||
                    !vessel.OpRouteAbbrev?.includes(
                        ED_KING_SCHED_ROUTE_ABBREV
                    ));
                */
            if (isDockedInKingston) {
                const st: DockedInKingston = {
                    order: 1,
                    disposition: "docked-in-kingston",
                    name: vessel.VesselName,
                };
                // Get minutes until scheduled time of departure
                if (vessel.ScheduledDeparture)
                    st.stdMins = Math.ceil(
                        (vessel.ScheduledDeparture.getTime() - now) / 1000 / 60
                    );
                status.push(st);
                continue;
            }

            // Is the vessel traveling to kingston?
            let isTravelingToKingston =
                !vessel.AtDock &&
                vessel.DepartingTerminalID === EDMONDS_TERMINAL_ID &&
                vessel.ArrivingTerminalID === KINGSTON_TERMINAL_ID &&
                (!!vessel.LeftDock || vessel.LeftDock === null);

            if (!isTravelingToKingston)
                isTravelingToKingston =
                    !vessel.AtDock &&
                    vessel.DepartingTerminalID === EDMONDS_TERMINAL_ID &&
                    (!!vessel.LeftDock || vessel.LeftDock === null);

            if (isTravelingToKingston) {
                // Get the normalized distance traveled. 0 = at kingston, 1 = at edmonds
                const vesselPos: LatLon = {
                    lat: vessel.Latitude,
                    lon: vessel.Longitude,
                };
                const distToKingston = haversineDistance(
                    vesselPos,
                    KINGSTON_TERMINAL_LATLON
                );
                const distPct = clamp(
                    0,
                    1,
                    Math.round(
                        100 * (1 - distToKingston / distBetweenTerminals)
                    ) / 100
                );
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
            const isDockedInEdmonds =
                vessel.AtDock &&
                vessel.DepartingTerminalID === EDMONDS_TERMINAL_ID;
            /*
                && (!!vessel.ArrivingTerminalID ||
                    !vessel.OpRouteAbbrev?.includes(
                        ED_KING_SCHED_ROUTE_ABBREV
                    ));
                */

            if (isDockedInEdmonds) {
                const st: DockedInEdmonds = {
                    order: 3,
                    disposition: "docked-in-edmonds",
                    name: vessel.VesselName,
                };
                // Get minutes until scheduled time of departure
                if (vessel.ScheduledDeparture)
                    st.stdMins = Math.ceil(
                        (vessel.ScheduledDeparture.getTime() - now) / 1000 / 60
                    );
                status.push(st);
                continue;
            }

            // Is the vessel traveling to edmonds?
            let isTravelingToEdmonds =
                !vessel.AtDock &&
                vessel.DepartingTerminalID === KINGSTON_TERMINAL_ID &&
                vessel.ArrivingTerminalID === EDMONDS_TERMINAL_ID &&
                (!!vessel.LeftDock || vessel.LeftDock === null);

            if (!isTravelingToEdmonds)
                isTravelingToEdmonds =
                    !vessel.AtDock &&
                    vessel.DepartingTerminalID === KINGSTON_TERMINAL_ID &&
                    (!!vessel.LeftDock || vessel.LeftDock === null);

            if (isTravelingToEdmonds) {
                const vesselPos: LatLon = {
                    lat: vessel.Latitude,
                    lon: vessel.Longitude,
                };
                const distToKingston = haversineDistance(
                    vesselPos,
                    KINGSTON_TERMINAL_LATLON
                );
                const distPct = clamp(
                    0,
                    1,
                    Math.round(
                        100 * (1 - distToKingston / distBetweenTerminals)
                    ) / 100
                );
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
                if (
                    (a as any).etaMins !== undefined &&
                    (b as any).etaMins !== undefined
                ) {
                    return (
                        parseFloat((a as any).etaMins) -
                        parseFloat((b as any).etaMins)
                    );
                } else if ((a as any).etaMins !== undefined) {
                    return -1;
                } else if ((b as any).etaMins !== undefined) {
                    return 1;
                }
                if (
                    (a as any).stdMins !== undefined &&
                    (b as any).stdMins !== undefined
                ) {
                    return (
                        parseFloat((a as any).stdMins) -
                        parseFloat((b as any).stdMins)
                    );
                } else if ((a as any).stdMins !== undefined) {
                    return -1;
                } else if ((b as any).stdMins !== undefined) {
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
    } catch (err: any) {
        console.error(`Failed to get vessel status: ${err.toString()}`);
        return {
            status: 500,
            statusText: err.toString(),
        };
    } finally {
        setTimeout(
            async () => await refreshVesselStatusAsync(),
            REFRESH_INTERVAL_MS
        );
    }
}

export async function startAsync() {
    await refreshVesselStatusAsync();
}
