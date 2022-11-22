export function dotnetDateToJSDate(gar: any): Date {
    const m = /^\/Date\(([\d-+]+)\)\/$/.exec(gar);
    if (m && m[1]) {
        // I hate myself for this
        const s = (0, eval)(m[1]);
        return new Date(s);
    }
    return undefined!;
}

export function fixupDateFields(obj: any, ...fieldNames: string[]) {
    for (const name of fieldNames) {
        if (typeof obj[name] === "string") {
            obj[name] = dotnetDateToJSDate(obj[name]);
        }
    }
}

export function clamp(min: number, max: number, v: number): number {
    if (min > max) {
        const t = min;
        min = max;
        max = t;
    }
    return Math.min(max, Math.max(min, v));
}
