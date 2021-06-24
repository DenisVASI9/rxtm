import { BehaviorSubject } from "rxjs";
export var EStatus;
(function (EStatus) {
    EStatus["process"] = "process";
    EStatus["completed"] = "completed";
    EStatus["error"] = "error";
    EStatus["pending"] = "pending";
})(EStatus || (EStatus = {}));
export class Job {
    constructor(jobId) {
        this.jobId = jobId;
        this.subject = new BehaviorSubject({
            percent: 0,
            message: 'job pending',
            type: EStatus.pending
        });
        this.steps = [];
        this.onStartCallbacks = [];
        this.onCompleteCallbacks = [];
        this.status = EStatus.pending;
    }
    getId() {
        return this.jobId;
    }
    getObserver() {
        return this.subject;
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
    addStep(step) {
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
                if (this.status === EStatus.error)
                    break;
                await this.steps[i].call(null, firstResult);
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
        }
        catch (e) {
            this.subject.next({
                type: EStatus.error,
                message: e.message,
                percent: percent
            });
        }
    }
    onStart(callback) {
        this.onStartCallbacks.push(callback);
        return this;
    }
    onComplete(callback) {
        this.onCompleteCallbacks.push(callback);
        return this;
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
//# sourceMappingURL=Job.js.map