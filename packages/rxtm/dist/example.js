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
    .step((self) => {
    const r = self.getPreviousResult();
    console.log('job 1 step 2', r);
    return 11;
})
    .step(() => {
    console.log('job 1 step 3');
    return 12;
})
    .step((self) => self.setPercent(100))
    .complete((self) => {
    self.sendData({ data: 123 });
})
    .catch((error, i) => {
    console.log('error', error, i);
})
    .start();
(_a = q.getJob(job1.jobId)) === null || _a === void 0 ? void 0 : _a.getObserver().subscribe((res) => {
    console.log(res);
});
//# sourceMappingURL=example.js.map