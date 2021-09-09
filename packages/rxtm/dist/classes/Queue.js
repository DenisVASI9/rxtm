"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Queue = void 0;
const Job_1 = require("./Job");
const uuid_1 = require("uuid");
class Queue {
    constructor(parallel = 1, cacheTimeout = 30000) {
        this.parallel = parallel;
        this.cacheTimeout = cacheTimeout;
        this.jobs = [];
        this.performing = 0;
    }
    onQueueReady() {
        const job = this.jobs.find((job) => job.isPending());
        if (job) {
            job.process();
            this.performing++;
            job.run().then(() => this.onJobRemoved());
        }
    }
    onJobAdded() {
        if (this.parallel > this.performing) {
            this.onQueueReady();
        }
    }
    onJobRemoved() {
        this.performing--;
        if (this.parallel > this.performing) {
            this.onQueueReady();
        }
    }
    setupJob(job) {
        const id = job.getId();
        const DESTROY_JOB = false;
        const DONT_TOUCH = true;
        job.onStart(() => {
            this.onJobAdded();
        });
        job.complete(() => {
            setTimeout(() => {
                this.jobs = this.jobs.filter((job) => {
                    if (job.getId() !== id) {
                        return DONT_TOUCH;
                    }
                    job.destroy();
                    return DESTROY_JOB;
                });
            }, this.cacheTimeout);
        });
    }
    createJob(options = {
        calculatePercent: true,
    }) {
        const jobId = uuid_1.v4();
        const job = new Job_1.Job(jobId, options);
        this.setupJob(job);
        this.jobs.push(job);
        return job;
    }
    getJob(id) {
        if (!id) {
            throw new Error('id must be a string');
        }
        const job = this.jobs.find((job) => job.getId() === id);
        return job ? job : null;
    }
}
exports.Queue = Queue;
//# sourceMappingURL=Queue.js.map