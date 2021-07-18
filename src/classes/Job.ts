import { BehaviorSubject } from "rxjs";
import { take } from "rxjs/operators";
import { AnyFunction, AnyFunctions, EStatus, IJobOptions, IJobStats } from "../types/Job";

export class Job {

  constructor(private readonly jobId: string, options: IJobOptions) {
    this.options = options;
  }

  private steps: AnyFunctions = [];
  private onStartCallbacks: AnyFunctions = [];
  private onCompleteCallbacks: AnyFunctions = [];
  private msg = "job pending";
  private percent: number = 0;
  private readonly options: IJobOptions = {};

  private subject = new BehaviorSubject<IJobStats>({
    type: EStatus.pending,
    percent: 0,
    message: this.msg
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

  private setPercent(percent: number) {
    this.percent = percent;
  }

  private calculatePercent(percentStep = 100 / this.steps.length) {
    if (this.options.calculatePercent) {
      this.percent += percentStep;
    }
  }

  async run() {
    try {
      let lastResult = await this.steps[0].call(null, null, {
        setPercent: this.setPercent.bind(this)
      });
      this.calculatePercent();
      this.subject.next({
        type: this.steps.length === 1 ? EStatus.completed : EStatus.process,
        percent: this.percent
      });
      for (let i = 1; i < this.steps.length; i++) {
        if (this.status === EStatus.error) break;
        lastResult = await this.steps[i].call(null, lastResult, {
          setPercent: this.setPercent.bind(this)
        });
        this.calculatePercent();
        this.subject.next({
          type: i === this.steps.length - 1 ? EStatus.completed : EStatus.process,
          percent: this.percent
        });
        if (this.percent === 100) {
          this.status = EStatus.completed;
          this.end();
        }
      }
    } catch (e) {
      this.subject.next({
        type: EStatus.error,
        message: e.message,
        percent: this.percent
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
