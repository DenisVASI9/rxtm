import { Queue } from "./classes/Queue";
(async () => {
    var _a;
    const q = new Queue(4);
    const job1 = q.createJob()
        .addStep(() => {
        console.log('job 1 step 1');
        return 11;
    })
        .addStep(async () => {
        console.log('job 1 step 2');
        await new Promise(resolve => {
            setTimeout(resolve, 5000);
        });
        return 11;
    })
        .addStep((result) => {
        console.log('job 1 step 3', result);
        return 12;
    })
        .start();
    const job2 = q.createJob()
        .addStep(async () => {
        console.log('job 2 step 1');
        return 21;
    })
        .addStep(() => {
        console.log('job 2 step 2');
        throw new Error('sasdfsadfsadf');
        return 11;
    })
        .addStep((result) => {
        console.log('job 2 step 3', result);
        return 22;
    })
        .start();
    const job3 = q.createJob()
        .addStep(async () => {
        console.log('job 3 step 1');
        return 21;
    })
        .addStep(() => {
        console.log('job 3 step 2');
        return 11;
    })
        .addStep((result) => {
        console.log('job 3 step 3', result);
        return 22;
    })
        .start();
    (_a = q.getJob(job2.jobId)) === null || _a === void 0 ? void 0 : _a.getObserver().subscribe((res) => {
        console.log(res);
    });
})();
//# sourceMappingURL=example.js.map