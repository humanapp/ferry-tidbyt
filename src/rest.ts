import * as vessels from "./vessels";
import * as waitTimes from "./waitTimes";
import * as bulletins from "./bulletins";
import { server } from "./server";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import fastifystatic from "@fastify/static";

const fileCache: {
    [route: string]: Buffer;
} = {};

export async function initAsync() {
    server.register(fastifystatic, {
        root: path.join(__dirname, "../public"),
    });

    server.get("/api/status", async (req, res) => {
        const status = vessels.getVesselCurrentStatus();
        if (status) {
            return res
                .status(200)
                .header("Cache-Control", "no-cache, no-store")
                .send(status);
        } else {
            return res.status(404).send();
        }
    });

    server.get("/api/image", async (req, res) => {
        const height = parseInt((req.query as any)["h"] || "0");

        res.header("Content-Type", "image/webp");

        const s = fs.readFileSync("./tidbyt/ferry-status.webp");

        if (height > 0) {
            const b = await sharp(s, { pages: -1 })
                .resize({
                    height,
                    kernel: sharp.kernel.nearest,
                })
                .withMetadata()
                .toBuffer();

            res.send(b);
        } else {
            res.send(s);
        }
    });
}

server.get("/api/waittimes", async (req, res) => {
    const wt = await waitTimes.getWaitTimesAsync();
    if (wt) {
        return res
            .status(200)
            .header("Cache-Control", "no-cache, no-store")
            .send(wt);
    } else {
        return res.status(404).send();
    }
});

server.get("/api/bulletins", async (req, res) => {
    const bt = await bulletins.getBulletinsAsync();
    if (bt) {
        return res
            .status(200)
            .header("Cache-Control", "no-cache, no-store")
            .send(bt);
    } else {
        return res.status(404).send();
    }
});

server.get("/api/vessels", async (req, res) => {
    const vs = await vessels.getVesselsOnRouteAsync();
    if (vs) {
        return res
            .status(200)
            .header("Cache-Control", "no-cache, no-store")
            .send(vs);
    } else {
        return res.status(404).send();
    }
});
