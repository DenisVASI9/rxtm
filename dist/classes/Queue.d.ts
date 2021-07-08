import { Job } from "./Job";
export declare class Queue {
    private readonly parallel;
    private readonly cacheTimeout;
    constructor(parallel?: number, cacheTimeout?: number);
    private jobs;
    private performing;
    private onQueueReady;
    private onJobAdded;
    private onJobRemoved;
    private setupJob;
    createJob(): Job;
    getJob(id: string): Job | null;
}
