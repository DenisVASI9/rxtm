import { Job } from "./Job";
import { v4 as uuidv4 } from 'uuid';
export class Queue {
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
        job.onStart(() => {
            this.onJobAdded();
        });
        job.onComplete(() => {
            setTimeout(() => {
                this.jobs = this.jobs.filter((job) => job.getId() !== id);
            }, this.cacheTimeout);
        });
    }
    createJob() {
        const jobId = uuidv4();
        const job = new Job(jobId);
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