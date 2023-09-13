import fs from "fs";
import axios from "axios";
import { getSetting } from "./env";
import { spawnAsync } from "./worker";
import { DeviceInfo } from "./types";

const REFRESH_INTERVAL_MS = 15 * 1000;

let prevWebp: string;

async function updateTidbytAsync() {
    try {
        try {
            const renderExitCode = await spawnAsync(`pixlet`, [
                "render",
                "./tidbyt/ferry-status.star",
            ]);
            if (renderExitCode) {
                throw new Error(
                    `pixlet render exited with code ${renderExitCode}`
                );
            }
        } catch (err: any) {
            return console.error(`Tidbyt update failed: ${err.toString()}`);
        }

        let webp: string;
        try {
            webp = fs.readFileSync("./tidbyt/ferry-status.webp", "base64");
        } catch (err: any) {
            return console.error(`Tidbyt update failed: ${err.toString()}`);
        }

        if (false && prevWebp !== webp) {
            prevWebp = webp;

            const devices = getSetting("TIDBYTS") as DeviceInfo[];

            for (const device of devices) {
                try {
                    const data = {
                        deviceID: device.deviceId,
                        image: webp,
                        installationID: "ferry",
                        background: true,
                    };
                    const config = {
                        withCredentials: true,
                        headers: {
                            Authorization: `Bearer ${device.apikey}`,
                        },
                    };

                    const res = await axios.post(
                        `https://api.tidbyt.com/v0/devices/${device.deviceId}/push`,
                        data,
                        config
                    );

                    if (res.status !== 200) {
                        throw new Error(res.statusText);
                    }

                    console.log(`Tidbyt ${device.deviceId} updated`);
                } catch (err: any) {
                    console.error(
                        `Tidbyt ${
                            device.deviceId
                        } update failed: ${err.toString()}`
                    );
                }
            }
        }
    } finally {
        setTimeout(async () => await updateTidbytAsync(), REFRESH_INTERVAL_MS);
    }
}

export async function startAsync() {
    setTimeout(async () => await updateTidbytAsync(), 2000);
}
