"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Job = void 0;
const rxjs_1 = require("rxjs");
const types_1 = require("../types");
class Job {
    constructor(jobId, options) {
        this.jobId = jobId;
        this.steps = [];
        this.onStartCallbacks = [];
        this.onCompleteCallbacks = [];
        this.onCatchCallbacks = [];
        this.msg = 'job pending';
        this.percent = 0;
        this.stepNumber = 0;
        this.results = [];
        this.options = {};
        this.subject = new rxjs_1.BehaviorSubject({
            type: types_1.EStatus.pending,
            percent: 0,
            message: this.msg,
        });
        this.self = {
            setPercent: this.setPercent.bind(this),
            getPreviousResult: this.getPreviousResult.bind(this),
            sendData: this.sendData.bind(this),
        };
        this.status = types_1.EStatus.pending;
        this.options = options;
    }
    getId() {
        return this.jobId;
    }
    getObserver() {
        return this.subject.asObservable();
    }
    isComplete() {
        return this.status === types_1.EStatus.completed;
    }
    isPerformed() {
        return this.status === types_1.EStatus.process;
    }
    isPending() {
        return this.status === types_1.EStatus.pending;
    }
    process() {
        this.status = types_1.EStatus.process;
    }
    sendData(data, status = this.status) {
        this.subject.next({
            type: status || types_1.EStatus.data,
            percent: this.percent,
            data,
        });
    }
    errored() {
        this.status = types_1.EStatus.error;
    }
    step(step) {
        this.steps.push(step);
        return this;
    }
    setPercent(percent) {
        this.percent = percent;
    }
    getPreviousResult(index = 0) {
        if (index) {
            const len = this.results.length - 1;
            return this.results[len];
        }
        console.log(this.results);
        return this.results[0];
    }
    calculatePercent(percentStep = 100 / this.steps.length) {
        if (this.options.calculatePercent) {
            this.percent += percentStep;
        }
    }
    async callStep(step) {
        const result = await step.call(null, this.self);
        if (rxjs_1.isObservable(result)) {
            return this.results.push(await rxjs_1.firstValueFrom(result));
        }
        return this.results.push(result);
    }
    async run() {
        try {
            await this.callStep(this.steps[0]);
            this.calculatePercent();
            this.subject.next({
                type: this.steps.length === 1 && this.onCompleteCallbacks.length <= 1
                    ? types_1.EStatus.completed
                    : types_1.EStatus.process,
                percent: this.percent,
            });
            for (let i = 1; i < this.steps.length; i++) {
                this.stepNumber = i;
                if (this.status === types_1.EStatus.error)
                    break;
                await this.callStep(this.steps[i]);
                this.calculatePercent();
                this.subject.next({
                    type: i === this.steps.length - 1 && this.onCompleteCallbacks.length <= 1
                        ? types_1.EStatus.completed
                        : types_1.EStatus.process,
                    percent: this.percent,
                });
                if (this.percent >= 100) {
                    this.status = types_1.EStatus.completed;
                    this.end();
                }
            }
        }
        catch (e) {
            this.onCatchCallbacks.forEach((func) => func(e, this.stepNumber));
            this.subject.next({
                type: types_1.EStatus.error,
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
    complete(callback) {
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
        this.status = types_1.EStatus.completed;
        this.onCompleteCallbacks.forEach(async (callback) => {
            const returned = await callback(this.self);
            if (returned) {
                this.sendData(returned, types_1.EStatus.completed);
            }
        });
    }
}
exports.Job = Job;
//# sourceMappingURL=Job.js.map