import * as child from "child_process";

export async function spawnAsync(
    cmd: string,
    args?: string[]
): Promise<number | null> {
    return new Promise<number | null>((resolve, reject) => {
        const worker = child.spawn(cmd, args);
        worker.on("exit", (code) => resolve(code));
    });
}
