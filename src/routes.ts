import * as vessels from "./vessels";
import { server } from "./server";

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
}
