import * as vessels from "./vessels";
import { server } from "./server";
import fs from "fs";
import sharp from "sharp";

export async function initAsync() {
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
        const s = fs.readFileSync("./tidbyt/ferry-status.webp");

        const b = await sharp(s, { pages: -1 })
            .resize({
                height: 320,
                kernel: sharp.kernel.nearest,
            })
            .withMetadata()
            .toBuffer();

        res.header("Content-Type", "image/webp");
        res.send(b);
    });
}
