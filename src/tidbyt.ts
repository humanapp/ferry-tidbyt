import axios, { AxiosRequestConfig } from "axios";
import { getSetting } from "./env";
import { spawnAsync } from "./worker";
import fs from "fs";
import url from "url";

const REFRESH_INTERVAL_MS = 15 * 1000;

type Credentials = {
    access_token: string;
    expires_in: number;
    refresh_token: string;
    scope: string;
    token_type: string;
};

let credentials: Credentials;
let credentialsExpireAt: number;

async function checkCredentialsAsync() {
    try {
        const now = Date.now();

        if (credentials && credentialsExpireAt - now > 1000) return;

        const params = new url.URLSearchParams();
        params.set("grant_type", "refresh_token");
        params.set("refresh_token", getSetting("TIDBYT_REFRESH_TOKEN"));
        const config: AxiosRequestConfig = {
            withCredentials: true,
            headers: {
                Authorization: `Basic ${getSetting("TIDBYT_ACCOUNT_ID")}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
        };
        const data = params.toString();
        const res = await axios.post(
            "https://login.tidbyt.com/oauth2/token",
            data,
            config
        );

        credentials = res.data as Credentials;
        credentialsExpireAt = now + credentials.expires_in * 1000;
    } catch (err: any) {
        console.error(`Tidbyt login failed: ${err.toString()}`);
    }
}

let prevWebp: string;

async function updateTidbytAsync() {
    try {
        await checkCredentialsAsync();

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
            if (prevWebp !== webp) {
                prevWebp = webp;

                const data = {
                    deviceID: getSetting("TIDBYT_DEVICE_ID"),
                    image: webp,
                    installationID: "ferry",
                    background: false,
                };
                const config = {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${credentials?.access_token}`,
                    },
                };

                const res = await axios.post(
                    `https://api.tidbyt.com/v0/devices/${getSetting(
                        "TIDBYT_DEVICE_ID"
                    )}/push`,
                    data,
                    config
                );
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
