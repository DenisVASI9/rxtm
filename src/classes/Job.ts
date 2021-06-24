import { BehaviorSubject } from "rxjs";
import { take } from "rxjs/operators";
import { AnyFunction, AnyFunctions, EStatus, IJobStats } from "../types/Job";

export class Job {

  constructor(private readonly jobId: string) {
  }

  private steps: AnyFunctions = [];
  private onStartCallbacks: AnyFunctions = [];
  private onCompleteCallbacks: AnyFunctions = [];
  private msg = "job pending";

  private subject = new BehaviorSubject<IJobStats>({
    percent: 0,
    message: this.msg,
    type: EStatus.pending
  });

  status = EStatus.pending;

  getId() {
    return this.jobId;
  }

  getObserver() {
    return this.subject.asObservable();
  }

  toPromise() {
    return new Promise(resolve => {
      this.subject.pipe(take(1)).subscribe(result => {
        resolve(result);
      });
    });
  }

  isComplete() {
    return this.status === EStatus.completed;
  }

  isPerformed() {
    return this.status === EStatus.process;
  }

  isPending() {
    return this.status === EStatus.pending;
  }

  process() {
    this.status = EStatus.process;
  }

  errored() {
    this.status = EStatus.error;
  }

  step(step: AnyFunction) {
    this.steps.push(step);
    return this;
  }

  async run() {
    let percent = 0;
    let percentStep = 100 / this.steps.length;
    try {
      const firstResult = await this.steps[0].call(null);
      percent += percentStep;
      this.subject.next({
        type: this.steps.length === 1 ? EStatus.completed : EStatus.process,
        percent: percent
      });
      for (let i = 1; i < this.steps.length; i++) {
        if (this.status === EStatus.error) break;
        await this.steps[i].call(this, firstResult);
        percent += percentStep;
        this.subject.next({
          type: i === this.steps.length - 1 ? EStatus.completed : EStatus.process,
          percent: percent
        });
        if (percent === 100) {
          this.status = EStatus.completed;
          this.end();
        }
      }
    } catch (e) {
      this.subject.next({
        type: EStatus.error,
        message: e.message,
        percent: percent
      });
    }
  }

  onStart(callback: AnyFunction) {
    this.onStartCallbacks.push(callback);
    return this;
  }

  onComplete(callback: AnyFunction) {
    this.onCompleteCallbacks.push(callback);
    return this;
  }

  destroy() {
    this.subject.unsubscribe();
  }

  start() {
    this.onStartCallbacks.forEach(callback => callback());
    return { jobId: this.jobId };
  }

  end() {
    this.status = EStatus.completed;
    this.onCompleteCallbacks.forEach(callback => callback());
  }
}
