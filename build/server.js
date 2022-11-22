"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startAsync = exports.server = void 0;
const fastify_1 = require("fastify");
const env_1 = require("./env");
exports.server = (0, fastify_1.fastify)();
async function startAsync() {
    const port = parseInt((0, env_1.getSetting)("PORT", true, "8082"));
    exports.server.listen({ port }, (err, address) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        console.log(`Server listening at ${address}`);
    });
}
exports.startAsync = startAsync;
//# sourceMappingURL=server.js.map