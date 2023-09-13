"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fixupBulletinFields = exports.fixupWaitTimeFields = exports.fixupScheduleFields = exports.fixupVesselLocationFields = void 0;
const util_1 = require("./util");
function fixupVesselLocationFields(vessel) {
    (0, util_1.fixupDateFields)(vessel, "LeftDock", "Eta", "ScheduledDeparture", "TimeStamp");
}
exports.fixupVesselLocationFields = fixupVesselLocationFields;
function fixupScheduleFields(schedule) {
    (0, util_1.fixupDateFields)(schedule, "ScheduleStart", "ScheduleEnd");
    schedule.TerminalCombos.forEach((combo) => combo.Times.forEach((time) => {
        (0, util_1.fixupDateFields)(time, "DepartingTime", "ArrivingTime");
        time.DepartTimeLocaleString = time.DepartingTime.toLocaleString();
    }));
}
exports.fixupScheduleFields = fixupScheduleFields;
function fixupWaitTimeFields(waitTime) {
    (0, util_1.fixupDateFields)(waitTime, "WaitTimeLastUpdated");
}
exports.fixupWaitTimeFields = fixupWaitTimeFields;
function fixupBulletinFields(bulletin) {
    (0, util_1.fixupDateFields)(bulletin, "BulletinLastUpdated", "BulletinLastUpdatedSortable");
}
exports.fixupBulletinFields = fixupBulletinFields;
//# sourceMappingURL=types.js.map