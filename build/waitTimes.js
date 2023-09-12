"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWaitTimesAsync = void 0;
const types_1 = require("./types");
const env_1 = require("./env");
const consts_1 = require("./consts");
const axios_1 = __importDefault(require("axios"));
const TERMINALS_BASE_URI = "https://www.wsdot.wa.gov/ferries/api/terminals/rest";
let lastCacheDate;
let waitTimes;
async function checkCacheAsync() {
    const res = await axios_1.default.get(`${TERMINALS_BASE_URI}/cacheflushdate`);
    const date = res.data;
    if (lastCacheDate !== date) {
        lastCacheDate = date;
        waitTimes = undefined;
    }
}
async function getWaitTimesAsync() {
    await checkCacheAsync();
    const getWaitTimes = async (termId) => {
        const res = await axios_1.default.get(`${TERMINALS_BASE_URI}/terminalwaittimes/${termId}?apiaccesscode=${(0, env_1.getSetting)("VESSELWATCH_APIKEY")}`);
        const waitTimes = res.data;
        const WT = waitTimes.WaitTimes || [];
        for (const waitTime of WT) {
            (0, types_1.fixupWaitTimeFields)(waitTime);
        }
        return waitTimes;
    };
    if (waitTimes === undefined) {
        const [edmonds, kingston] = await Promise.all([
            getWaitTimes(consts_1.EDMONDS_TERMINAL_ID),
            getWaitTimes(consts_1.KINGSTON_TERMINAL_ID),
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
exports.getWaitTimesAsync = getWaitTimesAsync;
//# sourceMappingURL=waitTimes.js.map