import axios, { AxiosRequestConfig } from "axios";
import { getSetting } from "./env";
import { spawnAsync } from "./worker";
import fs from "fs";
import url from "url";

const REFRESH_INTERVAL_MS = 15 * 1000;

let prevWebp: string;

async function updateTidbytAsync() {
    try {
        const renderExitCode = await spawnAsync(`pixlet`, [
            "render",
            "./tidbyt/ferry-status.star",
        ]);
        if (renderExitCode) {
            console.error(`pixlet render exited with code ${renderExitCode}`);
        } else {
            const webp = fs.readFileSync(
                "./tidbyt/ferry-status.webp",
                "base64"
            );
            if (false && prevWebp !== webp) {
                prevWebp = webp;

                const data = {
                    deviceID: getSetting("TIDBYT_DEVICE_ID"),
                    image: webp,
                    installationID: "ferry",
                    background: true,
                };
                const config = {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${getSetting("TIDBYT_APIKEY")}`,
                    },
                };

                const res = await axios.post(
                    `https://api.tidbyt.com/v0/devices/${getSetting(
                        "TIDBYT_DEVICE_ID"
                    )}/push`,
                    data,
                    config
                );

                if (res.status !== 200) {
                    throw new Error(res.statusText);
                }

                console.log("Tidbyt updated");
            }
        }
    } catch (err: any) {
        console.error(`Tidbyt update failed: ${err.toString()}`);
    }

    setTimeout(async () => await updateTidbytAsync(), REFRESH_INTERVAL_MS);
}

export async function startAsync() {
    await updateTidbytAsync();
}
