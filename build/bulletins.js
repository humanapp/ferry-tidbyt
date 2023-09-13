"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBulletinsAsync = void 0;
const types_1 = require("./types");
const env_1 = require("./env");
const consts_1 = require("./consts");
const axios_1 = __importDefault(require("axios"));
const TERMINALS_BASE_URI = "https://www.wsdot.wa.gov/ferries/api/terminals/rest";
let lastCacheDate;
let bulletins;
async function checkCacheAsync() {
    const res = await axios_1.default.get(`${TERMINALS_BASE_URI}/cacheflushdate`);
    const date = res.data;
    if (lastCacheDate !== date) {
        lastCacheDate = date;
        bulletins = undefined;
    }
}
async function getBulletinsAsync() {
    await checkCacheAsync();
    const getBulletins = async (termId) => {
        const res = await axios_1.default.get(`${TERMINALS_BASE_URI}/terminalbulletins/${termId}?apiaccesscode=${(0, env_1.getSetting)("VESSELWATCH_APIKEY")}`);
        const bulletins = res.data;
        const BT = bulletins.Bulletins || [];
        for (const bulletin of BT) {
            (0, types_1.fixupBulletinFields)(bulletin);
        }
        return bulletins;
    };
    if (bulletins === undefined) {
        const [edmonds, kingston] = await Promise.all([
            getBulletins(consts_1.EDMONDS_TERMINAL_ID),
            getBulletins(consts_1.KINGSTON_TERMINAL_ID),
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
exports.getBulletinsAsync = getBulletinsAsync;
//# sourceMappingURL=bulletins.js.map