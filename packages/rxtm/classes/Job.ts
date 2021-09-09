import { BehaviorSubject, firstValueFrom, isObservable } from 'rxjs';
import {
  AnyFunction,
  AnyFunctions,
  EStatus,
  IJobOptions,
  IJobStats,
} from '../types/Job';

export class Job {
  constructor(private readonly jobId: string, options: IJobOptions) {
    this.options = options;
  }

  private steps: AnyFunctions = [];
  private onStartCallbacks: AnyFunctions = [];
  private onCompleteCallbacks: AnyFunctions = [];
  private onCatchCallbacks: AnyFunctions = [];
  private msg = 'job pending';
  private percent = 0;
  private step_number = 0;
  private readonly options: IJobOptions = {};

  private subject = new BehaviorSubject<IJobStats>({
    type: EStatus.pending,
    percent: 0,
    message: this.msg,
  });

  status = EStatus.pending;

  getId() {
    return this.jobId;
  }

  getObserver() {
    return this.subject.asObservable();
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

  private async callStep(step: AnyFunction, lastResult = null) {
    const result = await step.call(null, lastResult, {
      setPercent: this.setPercent.bind(this),
    });

    if (isObservable(result)) {
      return await firstValueFrom(result);
    }

    return result;
  }

  async run() {
    try {
      let lastResult = await this.callStep(this.steps[0]);
      this.calculatePercent();
      this.subject.next({
        type: this.steps.length === 1 ? EStatus.completed : EStatus.process,
        percent: this.percent,
      });
      for (let i = 1; i < this.steps.length; i++) {
        // Синхронизируем шаг задачи c циклом, чтобы отдавать его в catch
        this.step_number = i;
        if (this.status === EStatus.error) break;
        lastResult = await this.callStep(this.steps[i], lastResult);
        this.calculatePercent();
        this.subject.next({
          type:
            i === this.steps.length - 1 ? EStatus.completed : EStatus.process,
          percent: this.percent,
        });
        if (this.percent === 100) {
          this.status = EStatus.completed;
          this.end();
        }
      }
    } catch (e) {
      this.onCatchCallbacks.forEach((func) => func(e, this.step_number));
      this.subject.next({
        type: EStatus.error,
        message: e.message,
        percent: this.percent,
      });
    }
  }

  onStart(callback: AnyFunction) {
    if (typeof callback === 'function') {
      this.onStartCallbacks.push(callback);
    }
    return this;
  }

  onComplete(callback: AnyFunction) {
    if (typeof callback === 'function') {
      this.onCompleteCallbacks.push(callback);
    }
    return this;
  }

  destroy() {
    this.subject.unsubscribe();
  }

  catch(callback) {
    if (typeof callback === 'function') {
      this.onCatchCallbacks.push(callback);
    }
    return this;
  }

  start() {
    this.onStartCallbacks.forEach((callback) => callback());
    return { jobId: this.jobId };
  }

  end() {
    this.status = EStatus.completed;
    this.onCompleteCallbacks.forEach((callback) => callback());
  }
}
