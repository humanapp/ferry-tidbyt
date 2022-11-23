import fs from "fs";
import AWS from "aws-sdk";

const REFRESH_INTERVAL_MS = 30 * 1000;

const settings: { env: { [key: string]: any } } = { env: {} };

function applySettings(env: any, allowOverwrite: boolean) {
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
export function getSetting<RetT = any>(
    name: string,
    optional?: boolean,
    defaultValue?: string
): RetT {
    let value = process.env[name] ?? settings.env[name];
    if (!value && !optional)
        throw new Error(`Setting ${name} not found in environment`);
    return value ? value! : defaultValue!;
}

/**
 * @returns True, if NODE_ENV is not "development".
 */
export function isProductionEnv(): boolean {
    return getSetting("NODE_ENV", true) !== "development";
}

async function loadEnvironmentOnceAsync() {
    // Load environment from local env.json file
    try {
        const env = JSON.parse(fs.readFileSync("./env.json").toString());
        applySettings(env, false); // don't overwrite existing values
    } catch {
        console.error("Error reading local env.json file");
    }

    // Load environment from AWS Secrets Manager
    try {
        const secretsManagerRegion = getSetting("AWS_SECRETS_MANAGER_REGION");
        const envSecretName = getSetting("AWS_ENV_SECRET_NAME");
        const awsAccessKeyId = getSetting("AWS_ACCESS_KEY_ID");
        const awsAccessKeySecret = getSetting("AWS_ACCESS_KEY_SECRET");

        const client = new AWS.SecretsManager({
            region: secretsManagerRegion,
            accessKeyId: awsAccessKeyId,
            secretAccessKey: awsAccessKeySecret,
        });

        const secret = await new Promise<string>((resolve, reject) => {
            client.getSecretValue({ SecretId: envSecretName! }, (err, data) => {
                if (err) {
                    return reject(
                        `Failed to read env from AWS. ${err.message}`
                    );
                }
                let secret: string | undefined;
                if ("SecretString" in data) {
                    secret = data.SecretString;
                } else if ("SecretBinary" in data) {
                    let buf = Buffer.from(
                        data.SecretBinary as string,
                        "base64"
                    );
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
    } catch (err: any) {
        console.error(err.toString());
    }
}

async function refreshEnvironmentAsync() {
    try {
        await loadEnvironmentOnceAsync();
    } catch (err: any) {
        console.error(err.toString());
    } finally {
        setTimeout(
            async () => await refreshEnvironmentAsync(),
            REFRESH_INTERVAL_MS
        );
    }
}

export async function initAsync() {
    await loadEnvironmentOnceAsync();
}

export async function startAsync() {
    setTimeout(
        async () => await refreshEnvironmentAsync(),
        REFRESH_INTERVAL_MS
    );
}
