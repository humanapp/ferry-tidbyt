import process from "process";
import dotenv from "dotenv";
import * as env from "./env";
import * as vessels from "./vessels";
import * as routes from "./routes";
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
    await vessels.initAsync();
    await routes.initAsync();
    await tidbyt.initAsync();
}

async function startAsync() {
    await vessels.startAsync();
    await tidbyt.startAsync();
    await server.startAsync();
}

(async () => {
    await initAsync();
    await startAsync();
})();
