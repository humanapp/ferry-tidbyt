"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clamp = exports.fixupDateFields = exports.dotnetDateToJSDate = void 0;
function dotnetDateToJSDate(gar) {
    const m = /^\/Date\(([\d-+]+)\)\/$/.exec(gar);
    if (m && m[1]) {
        // I hate myself for this
        const s = (0, eval)(m[1]);
        return new Date(s);
    }
    return undefined;
}
exports.dotnetDateToJSDate = dotnetDateToJSDate;
function fixupDateFields(obj, ...fieldNames) {
    for (const name of fieldNames) {
        if (typeof obj[name] === "string") {
            obj[name] = dotnetDateToJSDate(obj[name]);
        }
    }
}
exports.fixupDateFields = fixupDateFields;
function clamp(min, max, v) {
    if (min > max) {
        const t = min;
        min = max;
        max = t;
    }
    return Math.min(max, Math.max(min, v));
}
exports.clamp = clamp;
//# sourceMappingURL=util.js.map