"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startAsync = void 0;
const axios_1 = __importDefault(require("axios"));
const env_1 = require("./env");
const worker_1 = require("./worker");
const fs_1 = __importDefault(require("fs"));
const url_1 = __importDefault(require("url"));
const REFRESH_INTERVAL_MS = 15 * 1000;
let credentials;
let credentialsExpireAt;
async function checkCredentialsAsync() {
    try {
        const now = Date.now();
        if (credentials && credentialsExpireAt - now > 1000)
            return;
        const params = new url_1.default.URLSearchParams();
        params.set("grant_type", "refresh_token");
        params.set("refresh_token", (0, env_1.getSetting)("TIDBYT_REFRESH_TOKEN"));
        const config = {
            withCredentials: true,
            headers: {
                Authorization: `Basic ${(0, env_1.getSetting)("TIDBYT_ACCOUNT_ID")}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
        };
        const data = params.toString();
        const res = await axios_1.default.post("https://login.tidbyt.com/oauth2/token", data, config);
        credentials = res.data;
        credentialsExpireAt = now + credentials.expires_in * 1000;
    }
    catch (err) {
        console.error(`Tidbyt login failed: ${err.toString()}`);
    }
}
let prevWebp;
async function updateTidbytAsync() {
    try {
        await checkCredentialsAsync();
        const renderExitCode = await (0, worker_1.spawnAsync)(`pixlet`, [
            "render",
            "./tidbyt/ferry-status.star",
        ]);
        if (renderExitCode) {
            console.error(`pixlet render exited with code ${renderExitCode}`);
        }
        else {
            const webp = fs_1.default.readFileSync("./tidbyt/ferry-status.webp", "base64");
            if (prevWebp !== webp) {
                prevWebp = webp;
                const data = {
                    deviceID: (0, env_1.getSetting)("TIDBYT_DEVICE_ID"),
                    image: webp,
                    installationID: "ferry",
                    background: false,
                };
                const config = {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${credentials === null || credentials === void 0 ? void 0 : credentials.access_token}`,
                    },
                };
                const res = await axios_1.default.post(`https://api.tidbyt.com/v0/devices/${(0, env_1.getSetting)("TIDBYT_DEVICE_ID")}/push`, data, config);
            }
        }
    }
    catch (err) {
        console.error(`Tidbyt update failed: ${err.toString()}`);
    }
    setTimeout(async () => await updateTidbytAsync(), REFRESH_INTERVAL_MS);
}
async function startAsync() {
    await updateTidbytAsync();
}
exports.startAsync = startAsync;
//# sourceMappingURL=tidbyt.js.map