"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startAsync = exports.initAsync = exports.isProductionEnv = exports.getSetting = void 0;
const fs_1 = __importDefault(require("fs"));
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const REFRESH_INTERVAL_MS = 30 * 1000;
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
async function loadEnvironmentOnceAsync() {
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
    catch (err) {
        console.error(err.toString());
    }
}
async function refreshEnvironmentAsync() {
    try {
        await loadEnvironmentOnceAsync();
    }
    catch (err) {
        console.error(err.toString());
    }
    finally {
        setTimeout(async () => await refreshEnvironmentAsync(), REFRESH_INTERVAL_MS);
    }
}
async function initAsync() {
    await loadEnvironmentOnceAsync();
}
exports.initAsync = initAsync;
async function startAsync() {
    setTimeout(async () => await refreshEnvironmentAsync(), REFRESH_INTERVAL_MS);
}
exports.startAsync = startAsync;
//# sourceMappingURL=env.js.map