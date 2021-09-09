"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const Queue_1 = require("./classes/Queue");
const rxjs_1 = require("rxjs");
const q = new Queue_1.Queue(4);
const job1 = q
    .createJob()
    .step(() => new rxjs_1.Observable((subscriber) => {
    subscriber.next(100);
}))
    .step((res) => {
    console.log('job 1 step 2', res);
    return 11;
})
    .step(() => {
    console.log('job 1 step 3');
    throw new Error('Test error');
    return 12;
})
    .step((_, { setPercent }) => setPercent(100))
    .catch((error, i) => {
    console.log('error', error, i);
})
    .start();
(_a = q.getJob(job1.jobId)) === null || _a === void 0 ? void 0 : _a.getObserver().subscribe((res) => {
    console.log(res);
});
//# sourceMappingURL=example.js.map