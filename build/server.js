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
exports.server = void 0;
const process_1 = __importDefault(require("process"));
const dotenv_1 = __importDefault(require("dotenv"));
const fastify_1 = require("fastify");
const env = __importStar(require("./env"));
const vessels = __importStar(require("./vessels"));
const routes = __importStar(require("./routes"));
const env_1 = require("./env");
dotenv_1.default.config();
exports.server = (0, fastify_1.fastify)();
process_1.default
    .on("unhandledRejection", (reason, p) => {
    console.error(reason, "Unhandled Rejection at ", p);
})
    .on("uncaughtException", (err) => {
    console.error(err, "Uncaught Exception");
});
async function initAsync() {
    await env.initAsync();
    await vessels.initAsync();
    await routes.initAsync();
}
(async () => {
    await initAsync();
    const port = parseInt((0, env_1.getSetting)("PORT", true, "8082"));
    exports.server.listen({ port }, (err, address) => {
        if (err) {
            console.error(err);
            process_1.default.exit(1);
        }
        console.log(`Server listening at ${address}`);
    });
})();
//# sourceMappingURL=server.js.map