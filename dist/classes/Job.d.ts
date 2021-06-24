import { BehaviorSubject } from "rxjs";
export declare enum EStatus {
    process = "process",
    completed = "completed",
    error = "error",
    pending = "pending"
}
interface IJobStats {
    percent: number;
    message?: string;
    type: keyof typeof EStatus;
}
export declare class Job {
    private readonly jobId;
    constructor(jobId: any);
    private subject;
    private steps;
    private onStartCallbacks;
    private onCompleteCallbacks;
    status: EStatus;
    getId(): any;
    getObserver(): BehaviorSubject<IJobStats>;
    isComplete(): boolean;
    isPerformed(): boolean;
    isPending(): boolean;
    process(): void;
    errored(): void;
    addStep(step: any): this;
    run(): Promise<void>;
    onStart(callback: any): this;
    onComplete(callback: any): this;
    start(): {
        jobId: any;
    };
    end(): void;
}
export {};
