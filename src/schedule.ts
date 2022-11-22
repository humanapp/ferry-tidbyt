import { KINGSTON_TERMINAL_ID, EDMONDS_TERMINAL_ID } from "./consts";
import axios from "axios";
import { DateTime } from "luxon";
import { Schedule, fixupScheduleFields, ServiceResult } from "./types";
import { getSetting } from "./env";

const SCHEDULE_BASE_URI = "https://www.wsdot.wa.gov/ferries/api/schedule/rest";

let schedule: Schedule | undefined;
let lastCacheDate: any;

async function checkCacheAsync() {
    const res = await axios.get(`${SCHEDULE_BASE_URI}/cacheflushdate`);
    const date = res.data;
    if (lastCacheDate !== date) {
        lastCacheDate = date;
        schedule = undefined;
    }
}

export async function getScheduleAsync(): Promise<ServiceResult<Schedule>> {
    await checkCacheAsync();

    const dt = DateTime.now();
    const tripDate = dt.toISODate();

    if (!schedule) {
        const schres = await axios.get(
            `${SCHEDULE_BASE_URI}/schedule/${tripDate}/${EDMONDS_TERMINAL_ID}/${KINGSTON_TERMINAL_ID}?apiaccesscode=${getSetting(
                "VESSELWATCH_APIKEY"
            )}`
        );
        schedule = schres.data as Schedule;
        fixupScheduleFields(schedule);
    }

    return {
        status: 200,
        data: schedule,
    };
}
