import { fixupDateFields } from "./util";

export type ServiceResult<T> = {
    status: number;
    statusText?: string;
    data?: T;
};

export type DockedInKingston = {
    order: 1;
    disposition: "docked-in-kingston";
    name: string;
    stdMins?: number;
};

export type TravelingToKingston = {
    order: 2;
    disposition: "traveling-to-kingston";
    name: string;
    etaMins?: number;
    distPct?: number;
};

export type DockedInEdmonds = {
    order: 3;
    disposition: "docked-in-edmonds";
    name: string;
    stdMins?: number;
};

export type TravelingToEdmonds = {
    order: 4;
    disposition: "traveling-to-edmonds";
    name: string;
    etaMins?: number;
    distPct?: number;
};

export type VesselStatus =
    | DockedInKingston
    | TravelingToKingston
    | DockedInEdmonds
    | TravelingToEdmonds;

export type VesselLocation = {
    VesselID: number;
    VesselName: string;
    Mmsi: number;
    DepartingTerminalID: number;
    DepartingTerminalName: string;
    DepartingTerminalAbbrev: string;
    ArrivingTerminalID: number;
    ArrivingTerminalName: string;
    ArrivingTerminalAbbrev: string;
    Latitude: number;
    Longitude: number;
    Speed: number;
    Heading: number;
    InService: boolean;
    AtDock: boolean;
    LeftDock: Date;
    Eta: Date;
    EtaBasis: string;
    ScheduledDeparture: Date;
    OpRouteAbbrev: string[];
    VesselPositionNum: number;
    SortSeq: number;
    ManagedBy: number;
    TimeStamp: Date;
    VesselWatchShutID: number;
    VesselWatchShutMsg: string;
    VesselWatchShutFlag: string;
    VesselWatchStatus: string;
    VesselWatchMsg: string;
};

export function fixupVesselLocationFields(vessel: VesselLocation) {
    fixupDateFields(
        vessel,
        "LeftDock",
        "Eta",
        "ScheduledDeparture",
        "TimeStamp"
    );
}

export type TerminalCombo = {
    DepartingTerminalID: 8;
    DepartingTerminalName: string;
    ArrivingTerminalID: 12;
    ArrivingTerminalName: string;
    SailingNotes: string;
    Annotations: any[];
    AnnotationsIVR: any[];
    Times: DepartureTime[];
};

export type DepartureTime = {
    DepartingTime: Date;
    DepartTimeLocaleString: string;
    ArrivingTime: Date;
    LoadingRule: number;
    VesselID: number;
    VesselName: string;
    VesselHandicapAccessible: boolean;
    VesselPositionNum: number;
    Routes: number[];
    AnnotationIndexes: any[];
};

export type Schedule = {
    ScheduleID: number;
    ScheduleName: string;
    ScheduleSeason: number;
    SchedulePDFUrl: string;
    ScheduleStart: Date;
    ScheduleEnd: Date;
    AllRoutes: number[];
    TerminalCombos: TerminalCombo[];
};

export function fixupScheduleFields(schedule: Schedule) {
    fixupDateFields(schedule, "ScheduleStart", "ScheduleEnd");
    schedule.TerminalCombos.forEach((combo) =>
        combo.Times.forEach((time) => {
            fixupDateFields(time, "DepartingTime", "ArrivingTime");
            time.DepartTimeLocaleString = time.DepartingTime.toLocaleString();
        })
    );
}

export type LatLon = {
    lat: number;
    lon: number;
};

export type WaitTimes = {
    edmonds: any;
    kingston: any;
};

export function fixupWaitTimeFields(waitTime: any) {
    fixupDateFields(waitTime, "WaitTimeLastUpdated");
}

export type DeviceInfo = {
    deviceId: string;
    apikey: string;
};
