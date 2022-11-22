"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initAsync = exports.isProductionEnv = exports.getSetting = void 0;
const fs_1 = __importDefault(require("fs"));
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const settings = { env: {} };
function applySettings(env, allowOverwrite) {
    Object.keys(env).forEach((key) => {
        const cur = getSetting(key, true);
        const equal = !!cur && JSON.stringify(cur) === JSON.stringify(env[key]);
        if (!equal && (!cur || allowOverwrite)) {
            settings.env[key] = env[key];
            console.log(`Loaded setting: ${key}`);
        }
    });
}
/**
 * Reads a setting from the environment.
 * @param name The name of the setting.
 * @param optional If not optional and not found, an exception is thrown.
 * @param defaultValue If not required, this is the fallback value.
 * @returns The value of the setting.
 */
function getSetting(name, optional, defaultValue) {
    var _a;
    let value = (_a = process.env[name]) !== null && _a !== void 0 ? _a : settings.env[name];
    if (!value && !optional)
        throw new Error(`Setting ${name} not found in environment`);
    return value ? value : defaultValue;
}
exports.getSetting = getSetting;
/**
 * @returns True, if NODE_ENV is not "development".
 */
function isProductionEnv() {
    return getSetting("NODE_ENV", true) !== "development";
}
exports.isProductionEnv = isProductionEnv;
async function loadEnvironmentAsync() {
    // Load environment from local env.json file
    try {
        const env = JSON.parse(fs_1.default.readFileSync("./env.json").toString());
        applySettings(env, false); // don't overwrite existing values
    }
    catch (_a) {
        console.error("Error reading local env.json file");
    }
    // Load environment from AWS Secrets Manager
    try {
        const secretsManagerRegion = getSetting("AWS_SECRETS_MANAGER_REGION");
        const envSecretName = getSetting("AWS_ENV_SECRET_NAME");
        const awsAccessKeyId = getSetting("AWS_ACCESS_KEY_ID");
        const awsAccessKeySecret = getSetting("AWS_ACCESS_KEY_SECRET");
        const client = new aws_sdk_1.default.SecretsManager({
            region: secretsManagerRegion,
            accessKeyId: awsAccessKeyId,
            secretAccessKey: awsAccessKeySecret,
        });
        const secret = await new Promise((resolve, reject) => {
            client.getSecretValue({ SecretId: envSecretName }, (err, data) => {
                if (err) {
                    return reject(`Failed to read env from AWS. ${err.message}`);
                }
                let secret;
                if ("SecretString" in data) {
                    secret = data.SecretString;
                }
                else if ("SecretBinary" in data) {
                    let buf = Buffer.from(data.SecretBinary, "base64");
                    secret = buf.toString("utf8");
                }
                if (!secret) {
                    return reject("Failed to read env from AWS response blob");
                }
                resolve(secret);
            });
        });
        const env = JSON.parse(JSON.parse(secret)["env.json"]);
        applySettings(env, true); // do overwrite existing values
    }
    catch (e) {
        console.error(e);
    }
}
/**
 * Loads environment settings.
 */
async function initAsync() {
    await loadEnvironmentAsync();
    // Reload the environment every 30 secs, to pick up changes
    setInterval(loadEnvironmentAsync, 30000);
}
exports.initAsync = initAsync;
//# sourceMappingURL=env.js.map