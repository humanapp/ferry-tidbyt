"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getScheduleAsync = void 0;
const consts_1 = require("./consts");
const axios_1 = __importDefault(require("axios"));
const luxon_1 = require("luxon");
const types_1 = require("./types");
const env_1 = require("./env");
const SCHEDULE_BASE_URI = "https://www.wsdot.wa.gov/ferries/api/schedule/rest";
let schedule;
let lastCacheDate;
async function checkCacheAsync() {
    const res = await axios_1.default.get(`${SCHEDULE_BASE_URI}/cacheflushdate`);
    const date = res.data;
    if (lastCacheDate !== date) {
        lastCacheDate = date;
        schedule = undefined;
    }
}
async function getScheduleAsync() {
    await checkCacheAsync();
    const dt = luxon_1.DateTime.now();
    const tripDate = dt.toISODate();
    if (!schedule) {
        const schres = await axios_1.default.get(`${SCHEDULE_BASE_URI}/schedule/${tripDate}/${consts_1.EDMONDS_TERMINAL_ID}/${consts_1.KINGSTON_TERMINAL_ID}?apiaccesscode=${(0, env_1.getSetting)("VESSELWATCH_APIKEY")}`);
        schedule = schres.data;
        (0, types_1.fixupScheduleFields)(schedule);
    }
    return {
        status: 200,
        data: schedule,
    };
}
exports.getScheduleAsync = getScheduleAsync;
//# sourceMappingURL=schedule.js.map