"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Job = void 0;
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const Job_1 = require("../types/Job");
class Job {
    constructor(jobId, options) {
        this.jobId = jobId;
        this.steps = [];
        this.onStartCallbacks = [];
        this.onCompleteCallbacks = [];
        this.onCatchCallbacks = [];
        this.msg = 'job pending';
        this.percent = 0;
        this.options = {};
        this.subject = new rxjs_1.BehaviorSubject({
            type: Job_1.EStatus.pending,
            percent: 0,
            message: this.msg,
        });
        this.status = Job_1.EStatus.pending;
        this.options = options;
    }
    getId() {
        return this.jobId;
    }
    getObserver() {
        return this.subject.asObservable();
    }
    toPromise() {
        return new Promise((resolve) => {
            this.subject.pipe(operators_1.take(1)).subscribe((result) => {
                resolve(result);
            });
        });
    }
    isComplete() {
        return this.status === Job_1.EStatus.completed;
    }
    isPerformed() {
        return this.status === Job_1.EStatus.process;
    }
    isPending() {
        return this.status === Job_1.EStatus.pending;
    }
    process() {
        this.status = Job_1.EStatus.process;
    }
    errored() {
        this.status = Job_1.EStatus.error;
    }
    step(step) {
        this.steps.push(step);
        return this;
    }
    setPercent(percent) {
        this.percent = percent;
    }
    calculatePercent(percentStep = 100 / this.steps.length) {
        if (this.options.calculatePercent) {
            this.percent += percentStep;
        }
    }
    async callStep(step, lastResult = null) {
        const result = await step.call(null, lastResult, {
            setPercent: this.setPercent.bind(this),
        });
        if (rxjs_1.isObservable(result)) {
            return await rxjs_1.firstValueFrom(result);
        }
        return result;
    }
    async run() {
        try {
            let lastResult = await this.callStep(this.steps[0]);
            this.calculatePercent();
            this.subject.next({
                type: this.steps.length === 1 ? Job_1.EStatus.completed : Job_1.EStatus.process,
                percent: this.percent,
            });
            for (let i = 1; i < this.steps.length; i++) {
                if (this.status === Job_1.EStatus.error)
                    break;
                lastResult = await this.callStep(this.steps[i], lastResult);
                this.calculatePercent();
                this.subject.next({
                    type: i === this.steps.length - 1 ? Job_1.EStatus.completed : Job_1.EStatus.process,
                    percent: this.percent,
                });
                if (this.percent === 100) {
                    this.status = Job_1.EStatus.completed;
                    this.end();
                }
            }
        }
        catch (e) {
            this.onCatchCallbacks.forEach((func) => func(e));
            this.subject.next({
                type: Job_1.EStatus.error,
                message: e.message,
                percent: this.percent,
            });
        }
    }
    onStart(callback) {
        if (typeof callback === 'function') {
            this.onStartCallbacks.push(callback);
        }
        return this;
    }
    onComplete(callback) {
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
        this.status = Job_1.EStatus.completed;
        this.onCompleteCallbacks.forEach((callback) => callback());
    }
}
exports.Job = Job;
//# sourceMappingURL=Job.js.map