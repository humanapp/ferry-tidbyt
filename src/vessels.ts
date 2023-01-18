import axios from "axios";
import {
    ServiceResult,
    VesselLocation,
    fixupVesselLocationFields,
    VesselStatus,
    LatLon,
    DockedInEdmonds,
    DockedInKingston,
} from "./types";
import { getSetting } from "./env";
import { getScheduleAsync } from "./schedule";
import {
    DISTANCE_BETWEEN_TERMINALS,
    EDMONDS_TERMINAL_ID,
    KINGSTON_TERMINAL_ID,
    KINGSTON_TERMINAL_LATLON,
} from "./consts";
import haversineDistance from "haversine-distance";
import { clamp } from "./util";

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

async function getVesselsOnRouteAsync(): Promise<
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
        .filter(
            (ves) =>
                ves.ArrivingTerminalID === KINGSTON_TERMINAL_ID ||
                ves.DepartingTerminalID === KINGSTON_TERMINAL_ID ||
                ves.ArrivingTerminalID === EDMONDS_TERMINAL_ID ||
                ves.DepartingTerminalID === EDMONDS_TERMINAL_ID
        );

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

        // Is there a vessel docked in kingston?
        const dockedInKingston = vessels.find(
            (vessel) =>
                vessel.VesselName &&
                vessel.AtDock &&
                vessel.DepartingTerminalID === KINGSTON_TERMINAL_ID
        );
        if (dockedInKingston) {
            const st: DockedInKingston = {
                disposition: "docked-in-kingston",
                name: dockedInKingston.VesselName,
            };
            // Get minutes until scheduled time of departure
            if (dockedInKingston.ScheduledDeparture)
                st.stdMins = Math.ceil(
                    (dockedInKingston.ScheduledDeparture.getTime() - now) /
                        1000 /
                        60
                );
            status.push(st);
        }

        // Is there a vessel traveling to kingston?
        const travelingToKingston = vessels.find(
            (vessel) =>
                vessel.VesselName &&
                !vessel.AtDock &&
                vessel.DepartingTerminalID === EDMONDS_TERMINAL_ID &&
                vessel.ArrivingTerminalID === KINGSTON_TERMINAL_ID &&
                !!vessel.LeftDock
        );
        if (travelingToKingston) {
            // Get the normalized distance traveled. 0 = at kingston, 1 = at edmonds
            const vesselPos: LatLon = {
                lat: travelingToKingston.Latitude,
                lon: travelingToKingston.Longitude,
            };
            const distToKingston = haversineDistance(
                vesselPos,
                KINGSTON_TERMINAL_LATLON
            );
            const distPct = clamp(
                0,
                1,
                Math.round(100 * (1 - distToKingston / distBetweenTerminals)) /
                    100
            );
            // Get minutes until estimated time of arrival
            const etaMins = travelingToKingston.Eta
                ? Math.ceil(
                      (travelingToKingston.Eta.getTime() - now) / 1000 / 60
                  )
                : undefined;
            status.push({
                disposition: "traveling-to-kingston",
                name: travelingToKingston.VesselName,
                etaMins,
                distPct,
            });
        }

        // Is there a vessel docked in edmonds, yet to depart for kingston?
        const dockedInEdmonds = vessels.find(
            (vessel) =>
                vessel.VesselName &&
                vessel.AtDock &&
                vessel.DepartingTerminalID === EDMONDS_TERMINAL_ID
        );
        if (dockedInEdmonds) {
            const st: DockedInEdmonds = {
                disposition: "docked-in-edmonds",
                name: dockedInEdmonds.VesselName,
            };
            // Get minutes until scheduled time of departure
            if (dockedInEdmonds.ScheduledDeparture)
                st.stdMins = Math.ceil(
                    (dockedInEdmonds.ScheduledDeparture.getTime() - now) /
                        1000 /
                        60
                );
            status.push(st);
        }

        // Is there a vessel traveling to edmonds?
        const travelingToEdmonds = vessels.find(
            (vessel) =>
                vessel.VesselName &&
                !vessel.AtDock &&
                vessel.DepartingTerminalID === KINGSTON_TERMINAL_ID &&
                vessel.ArrivingTerminalID === EDMONDS_TERMINAL_ID &&
                (vessel.LeftDock || vessel.LeftDock === null)
        );
        if (travelingToEdmonds) {
            const vesselPos: LatLon = {
                lat: travelingToEdmonds.Latitude,
                lon: travelingToEdmonds.Longitude,
            };
            const distToKingston = haversineDistance(
                vesselPos,
                KINGSTON_TERMINAL_LATLON
            );
            const distPct = clamp(
                0,
                1,
                Math.round(100 * (1 - distToKingston / distBetweenTerminals)) /
                    100
            );
            const etaMins = travelingToEdmonds.Eta
                ? Math.ceil(
                      (travelingToEdmonds.Eta.getTime() - now) / 1000 / 60
                  )
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
