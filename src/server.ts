import { fastify } from "fastify";
import { getSetting } from "./env";

export const server = fastify();

export async function startAsync() {
    const port = parseInt(getSetting("PORT", true, "8082"));

    server.listen({ port }, (err, address) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        console.log(`Server listening at ${address}`);
    });
}
