"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVesselLocationAsync = void 0;
const axios_1 = __importDefault(require("axios"));
const process_1 = __importDefault(require("process"));
const types_1 = require("./types");
const VESSELS_BASE_URI = "https://www.wsdot.wa.gov/ferries/api/vessels/rest";
async function getVesselLocationAsync(vesselId) {
    const locres = await axios_1.default.get(`${VESSELS_BASE_URI}/vessellocations/${vesselId}?apiaccesscode=${process_1.default.env.VESSELWATCH_APIKEY}`);
    const vessel = locres.data;
    if (!vessel)
        return {
            status: 404,
        };
    (0, types_1.fixupVesselLocationFields)(vessel);
    console.log(JSON.stringify(vessel));
    return {
        status: 200,
        data: vessel,
    };
}
exports.getVesselLocationAsync = getVesselLocationAsync;
//# sourceMappingURL=vessel.js.map