import { BehaviorSubject, firstValueFrom, isObservable } from 'rxjs';
import {
  AnyFunction,
  AnyFunctions,
  EStatus,
  IJobOptions,
  IJobStats,
} from '../types';

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
  private lastResult = null;
  private readonly options: IJobOptions = {};

  private subject = new BehaviorSubject<IJobStats>({
    type: EStatus.pending,
    percent: 0,
    message: this.msg,
  });

  private self = {
    setPercent: this.setPercent.bind(this),
    getPreviousResult: this.getPreviousResult.bind(this),
    sendData: this.sendData.bind(this),
  };

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

  private sendData(data: any) {
    this.subject.next({
      type: EStatus.data,
      percent: this.percent,
      data,
    });
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

  getPreviousResult() {
    return this.lastResult;
  }

  private calculatePercent(percentStep = 100 / this.steps.length) {
    if (this.options.calculatePercent) {
      this.percent += percentStep;
    }
  }

  private async callStep(step: AnyFunction) {
    const result = await step.call(null, this.self);

    if (isObservable(result)) {
      return await firstValueFrom(result);
    }

    return result;
  }

  async run() {
    try {
      this.lastResult = await this.callStep(this.steps[0]);
      this.calculatePercent();
      this.subject.next({
        type: this.steps.length === 1 ? EStatus.completed : EStatus.process,
        percent: this.percent,
      });
      for (let i = 1; i < this.steps.length; i++) {
        // Синхронизируем шаг задачи c циклом, чтобы отдавать его в catch
        this.step_number = i;
        if (this.status === EStatus.error) break;
        this.lastResult = await this.callStep(this.steps[i]);
        this.calculatePercent();
        this.subject.next({
          type:
            i === this.steps.length - 1 ? EStatus.completed : EStatus.process,
          percent: this.percent,
        });
        if (this.percent >= 100) {
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

  complete(callback: AnyFunction) {
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
    this.onCompleteCallbacks.forEach((callback) => callback(this.self));
  }
}
