import process from "process";
import dotenv from "dotenv";
import { fastify } from "fastify";
import * as env from "./env";
import * as vessels from "./vessels";
import * as routes from "./routes";
import { getSetting } from "./env";

dotenv.config();

export const server = fastify();

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

    const port = parseInt(getSetting("PORT", true, "8082"));

    server.listen({ port }, (err, address) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        console.log(`Server listening at ${address}`);
    });
})();
