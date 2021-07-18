import { AnyFunction, EStatus, IJobOptions, IJobStats } from "../types/Job";
export declare class Job {
    private readonly jobId;
    constructor(jobId: string, options: IJobOptions);
    private steps;
    private onStartCallbacks;
    private onCompleteCallbacks;
    private msg;
    private percent;
    private readonly options;
    private subject;
    status: EStatus;
    getId(): string;
    getObserver(): import("rxjs").Observable<IJobStats>;
    toPromise(): Promise<unknown>;
    isComplete(): boolean;
    isPerformed(): boolean;
    isPending(): boolean;
    process(): void;
    errored(): void;
    step(step: AnyFunction): this;
    private setPercent;
    private calculatePercent;
    run(): Promise<void>;
    onStart(callback: AnyFunction): this;
    onComplete(callback: AnyFunction): this;
    destroy(): void;
    start(): {
        jobId: string;
    };
    end(): void;
}
