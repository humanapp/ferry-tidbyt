"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startAsync = void 0;
const fs_1 = __importDefault(require("fs"));
const axios_1 = __importDefault(require("axios"));
const env_1 = require("./env");
const worker_1 = require("./worker");
const REFRESH_INTERVAL_MS = 15 * 1000;
let prevWebp;
async function updateTidbytAsync() {
    try {
        try {
            const renderExitCode = await (0, worker_1.spawnAsync)(`pixlet`, [
                "render",
                "./tidbyt/ferry-status.star",
            ]);
            if (renderExitCode) {
                throw new Error(`pixlet render exited with code ${renderExitCode}`);
            }
        }
        catch (err) {
            return console.error(`Tidbyt update failed: ${err.toString()}`);
        }
        let webp;
        try {
            webp = fs_1.default.readFileSync("./tidbyt/ferry-status.webp", "base64");
        }
        catch (err) {
            return console.error(`Tidbyt update failed: ${err.toString()}`);
        }
        if (prevWebp !== webp) {
            prevWebp = webp;
            const devices = (0, env_1.getSetting)("TIDBYTS");
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
                    const res = await axios_1.default.post(`https://api.tidbyt.com/v0/devices/${device.deviceId}/push`, data, config);
                    if (res.status !== 200) {
                        throw new Error(res.statusText);
                    }
                    console.log(`Tidbyt ${device.deviceId} updated`);
                }
                catch (err) {
                    console.error(`Tidbyt ${device.deviceId} update failed: ${err.toString()}`);
                }
            }
        }
    }
    finally {
        setTimeout(async () => await updateTidbytAsync(), REFRESH_INTERVAL_MS);
    }
}
async function startAsync() {
    setTimeout(async () => await updateTidbytAsync(), 2000);
}
exports.startAsync = startAsync;
//# sourceMappingURL=tidbyt.js.map