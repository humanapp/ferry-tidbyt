import { WaitTimes, WSDOTBulletin, WaitTimeVal } from "./types";
import { KINGSTON_TERMINAL_NAME, EDMONDS_TERMINAL_NAME } from "./consts";
import * as bulletins from "./bulletins";

export async function getWaitTimesAsync(): Promise<WaitTimes> {
    const waitTimeFromBulletins = (
        terminalName: string,
        wsdotbts: WSDOTBulletin[]
    ): WaitTimeVal => {
        terminalName = terminalName.toLowerCase();
        if (!wsdotbts.length) return "green";
        for (const bt of wsdotbts) {
            const m = /(\S+) Hour Wait/.exec(bt.BulletinTitle);
            if (m && m[1]) {
                if (!bt.BulletinTitle.toLowerCase().includes(terminalName))
                    continue;
                switch (m[1].toLowerCase()) {
                    case "one":
                        return "yellow";
                    case "two":
                        return "orange";
                    default:
                        return "red";
                }
            }
        }
        return "green";
    };

    const bts = await bulletins.getBulletinsAsync();

    const waitTimes: WaitTimes = {
        left: waitTimeFromBulletins(
            KINGSTON_TERMINAL_NAME,
            bts.data?.kingston.Bulletins || []
        ),
        right: waitTimeFromBulletins(
            EDMONDS_TERMINAL_NAME,
            bts.data?.edmonds.Bulletins || []
        ),
    };

    return waitTimes;
}
