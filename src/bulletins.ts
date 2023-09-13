import { ServiceResult, Bulletins, fixupBulletinFields } from "./types";
import { getSetting } from "./env";
import { KINGSTON_TERMINAL_ID, EDMONDS_TERMINAL_ID } from "./consts";
import axios from "axios";

const TERMINALS_BASE_URI =
    "https://www.wsdot.wa.gov/ferries/api/terminals/rest";

let lastCacheDate: any;

let bulletins: Bulletins | undefined;

async function checkCacheAsync() {
    const res = await axios.get(`${TERMINALS_BASE_URI}/cacheflushdate`);
    const date = res.data;
    if (lastCacheDate !== date) {
        lastCacheDate = date;
        bulletins = undefined;
    }
}

export async function getBulletinsAsync(): Promise<ServiceResult<Bulletins>> {
    await checkCacheAsync();

    const getBulletins = async (termId: number) => {
        const res = await axios.get(
            `${TERMINALS_BASE_URI}/terminalbulletins/${termId}?apiaccesscode=${getSetting(
                "VESSELWATCH_APIKEY"
            )}`
        );
        const bulletins = res.data;

        const BT = bulletins.Bulletins || [];

        for (const bulletin of BT) {
            fixupBulletinFields(bulletin);
        }
        return bulletins;
    };

    if (bulletins === undefined) {
        const [edmonds, kingston] = await Promise.all([
            getBulletins(EDMONDS_TERMINAL_ID),
            getBulletins(KINGSTON_TERMINAL_ID),
        ]);

        bulletins = {
            edmonds,
            kingston,
        };
    }

    return {
        status: 200,
        data: bulletins,
    };
}
