import { Job } from "../classes/Job";
export declare enum EStatus {
    process = "process",
    completed = "completed",
    error = "error",
    pending = "pending"
}
export interface IJobStats {
    percent: number;
    message?: string;
    type: keyof typeof EStatus;
}
export declare type Jobs = Job[];
export declare type AnyFunction = (...args: any[]) => any;
export declare type AnyFunctions = AnyFunction[];
