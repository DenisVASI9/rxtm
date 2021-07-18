import { Job } from "./Job";
import { v4 as uuidv4 } from 'uuid';
export class Queue {
    parallel;
    cacheTimeout;
    constructor(parallel = 1, cacheTimeout = 30000) {
        this.parallel = parallel;
        this.cacheTimeout = cacheTimeout;
    }
    jobs = [];
    performing = 0;
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
        job.onComplete(() => {
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
        calculatePercent: true
    }) {
        const jobId = uuidv4();
        const job = new Job(jobId, options);
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
//# sourceMappingURL=Queue.js.map