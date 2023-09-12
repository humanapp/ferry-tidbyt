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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initAsync = void 0;
const vessels = __importStar(require("./vessels"));
const waitTimes = __importStar(require("./waitTimes"));
const server_1 = require("./server");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const sharp_1 = __importDefault(require("sharp"));
const static_1 = __importDefault(require("@fastify/static"));
const fileCache = {};
async function initAsync() {
    server_1.server.register(static_1.default, {
        root: path_1.default.join(__dirname, "../public"),
    });
    server_1.server.get("/api/status", async (req, res) => {
        const status = vessels.getVesselCurrentStatus();
        if (status) {
            return res
                .status(200)
                .header("Cache-Control", "no-cache, no-store")
                .send(status);
        }
        else {
            return res.status(404).send();
        }
    });
    server_1.server.get("/api/image", async (req, res) => {
        const height = parseInt(req.query["h"] || "0");
        res.header("Content-Type", "image/webp");
        const s = fs_1.default.readFileSync("./tidbyt/ferry-status.webp");
        if (height > 0) {
            const b = await (0, sharp_1.default)(s, { pages: -1 })
                .resize({
                height,
                kernel: sharp_1.default.kernel.nearest,
            })
                .withMetadata()
                .toBuffer();
            res.send(b);
        }
        else {
            res.send(s);
        }
    });
}
exports.initAsync = initAsync;
server_1.server.get("/api/waittimes", async (req, res) => {
    const wt = await waitTimes.getWaitTimesAsync();
    if (wt) {
        return res
            .status(200)
            .header("Cache-Control", "no-cache, no-store")
            .send(wt);
    }
    else {
        return res.status(404).send();
    }
});
//# sourceMappingURL=rest.js.map