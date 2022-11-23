import process from "process";
import dotenv from "dotenv";
import * as env from "./env";
import * as vessels from "./vessels";
import * as rest from "./rest";
import * as tidbyt from "./tidbyt";
import * as server from "./server";

dotenv.config();

process
    .on("unhandledRejection", (reason, p) => {
        console.error(reason, "Unhandled Rejection at ", p);
    })
    .on("uncaughtException", (err) => {
        console.error(err, "Uncaught Exception");
    });

async function initAsync() {
    await env.initAsync();
    await rest.initAsync();
}

async function startAsync() {
    await env.startAsync();
    await vessels.startAsync();
    await tidbyt.startAsync();
    await server.startAsync();
}

(async () => {
    await initAsync();
    await startAsync();
})();
