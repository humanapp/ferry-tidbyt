import process from "process";
import dotenv from "dotenv";
import * as env from "./env";
import * as vessels from "./vessels";
import * as routes from "./routes";
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
}

(async () => {
    await initAsync();
    await server.startAsync();
})();
