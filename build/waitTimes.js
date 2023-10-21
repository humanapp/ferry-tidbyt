"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWaitTimesAsync = void 0;
const consts_1 = require("./consts");
const bulletins = __importStar(require("./bulletins"));
async function getWaitTimesAsync() {
    var _a, _b;
    const waitTimeFromBulletins = (terminalName, wsdotbts) => {
        terminalName = terminalName.toLowerCase();
        if (!wsdotbts.length)
            return "green";
        for (const bt of wsdotbts) {
            let m = /:?([\d]+|[\w]+)[\s-]+hour wait/i.exec(bt.BulletinTitle);
            if (!m || !m[1])
                m = /:?([\d]+|[\w]+)[\s-]+hr\.? wait/i.exec(bt.BulletinTitle);
            if (m && m[1]) {
                if (!bt.BulletinTitle.toLowerCase().includes(terminalName))
                    continue;
                switch (m[1].toLowerCase()) {
                    case "one":
                    case "1":
                        return "yellow";
                    case "two":
                    case "2":
                        return "orange";
                    default:
                        return "red";
                }
            }
            m = /([\d\S]+)[\s-]+minute wait/i.exec(bt.BulletinTitle);
            if (!m || m[1])
                m = /([\d\S]+)[\s-]+min\.? wait/i.exec(bt.BulletinTitle);
            if (m && m[1]) {
                if (!bt.BulletinTitle.toLowerCase().includes(terminalName))
                    continue;
                switch (m[1].toLowerCase()) {
                    case "60":
                        return "yellow";
                    case "90":
                        return "orange";
                    default:
                        return "red";
                }
            }
        }
        return "green";
    };
    const bts = await bulletins.getBulletinsAsync();
    const waitTimes = {
        left: waitTimeFromBulletins(consts_1.KINGSTON_TERMINAL_NAME, ((_a = bts.data) === null || _a === void 0 ? void 0 : _a.kingston.Bulletins) || []),
        right: waitTimeFromBulletins(consts_1.EDMONDS_TERMINAL_NAME, ((_b = bts.data) === null || _b === void 0 ? void 0 : _b.edmonds.Bulletins) || []),
    };
    return waitTimes;
}
exports.getWaitTimesAsync = getWaitTimesAsync;
//# sourceMappingURL=waitTimes.js.map