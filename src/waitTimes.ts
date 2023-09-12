import { ServiceResult, WaitTimes, fixupWaitTimeFields } from "./types";
import { getSetting } from "./env";
import { KINGSTON_TERMINAL_ID, EDMONDS_TERMINAL_ID } from "./consts";
import axios from "axios";

const TERMINALS_BASE_URI =
    "https://www.wsdot.wa.gov/ferries/api/terminals/rest";

let lastCacheDate: any;

let waitTimes: WaitTimes | undefined;

async function checkCacheAsync() {
    const res = await axios.get(`${TERMINALS_BASE_URI}/cacheflushdate`);
    const date = res.data;
    if (lastCacheDate !== date) {
        lastCacheDate = date;
        waitTimes = undefined;
    }
}

export async function getWaitTimesAsync(): Promise<ServiceResult<WaitTimes>> {
    await checkCacheAsync();

    const getWaitTimes = async (termId: number) => {
        const res = await axios.get(
            `${TERMINALS_BASE_URI}/terminalwaittimes/${termId}?apiaccesscode=${getSetting(
                "VESSELWATCH_APIKEY"
            )}`
        );
        const waitTimes = res.data;

        const WT = waitTimes.WaitTimes || [];

        for (const waitTime of WT) {
            fixupWaitTimeFields(waitTime);
        }
        return waitTimes;
    };

    if (waitTimes === undefined) {
        const [edmonds, kingston] = await Promise.all([
            getWaitTimes(EDMONDS_TERMINAL_ID),
            getWaitTimes(KINGSTON_TERMINAL_ID),
        ]);

        waitTimes = {
            edmonds,
            kingston,
        };
    }

    return {
        status: 200,
        data: waitTimes,
    };
}
