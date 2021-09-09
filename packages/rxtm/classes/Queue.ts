import { Job } from './Job';
import { v4 as uuidv4 } from 'uuid';
import { IJobOptions, Jobs } from '../types/Job';

export class Queue {
  constructor(
    private readonly parallel = 1,
    private readonly cacheTimeout = 30000,
  ) {}

  private jobs: Jobs = [];
  private performing = 0;

  private onQueueReady() {
    const job = this.jobs.find((job) => job.isPending());
    if (job) {
      job.process();
      this.performing++;
      job.run().then(() => this.onJobRemoved());
    }
  }

  private onJobAdded() {
    if (this.parallel > this.performing) {
      this.onQueueReady();
    }
  }

  private onJobRemoved() {
    this.performing--;
    if (this.parallel > this.performing) {
      this.onQueueReady();
    }
  }

  private setupJob(job: Job) {
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

  createJob(
    options: IJobOptions = {
      calculatePercent: true,
    },
  ): Job {
    const jobId = uuidv4();
    const job = new Job(jobId, options);
    this.setupJob(job);
    this.jobs.push(job);
    return job;
  }

  getJob(id: string): Job | null {
    if (!id) {
      throw new Error('id must be a string');
    }

    const job = this.jobs.find((job) => job.getId() === id);
    return job ? job : null;
  }
}
