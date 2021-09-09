import { AnyFunction, EStatus, IJobOptions, IJobStats } from '../types';
export declare class Job {
    private readonly jobId;
    constructor(jobId: string, options: IJobOptions);
    private steps;
    private onStartCallbacks;
    private onCompleteCallbacks;
    private onCatchCallbacks;
    private msg;
    private percent;
    private stepNumber;
    private results;
    private readonly options;
    private subject;
    private self;
    status: EStatus;
    getId(): string;
    getObserver(): import("rxjs").Observable<IJobStats>;
    isComplete(): boolean;
    isPerformed(): boolean;
    isPending(): boolean;
    process(): void;
    private sendData;
    errored(): void;
    step(step: AnyFunction): this;
    private setPercent;
    getPreviousResult(index?: number): any;
    private calculatePercent;
    private callStep;
    run(): Promise<void>;
    onStart(callback: AnyFunction): this;
    complete(callback: AnyFunction): this;
    destroy(): void;
    catch(callback: any): this;
    start(): {
        jobId: string;
    };
    end(): void;
}
