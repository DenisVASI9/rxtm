import { Queue } from "./classes/Queue";
(async () => {
    const q = new Queue(4);
    const job1 = q.createJob({
        calculatePercent: false
    })
        .step((_, { setPercent }) => {
        setPercent(123123);
        console.log("job 1 step 1");
        return 11;
    })
        .step(() => {
        console.log("job 1 step 2");
        return 11;
    })
        .step(() => {
        console.log("job 1 step 3");
        return 12;
    })
        .step((_, { setPercent }) => setPercent(100))
        .start();
    q.getJob(job1.jobId)
        ?.getObserver()
        .subscribe((res) => {
        console.log(res);
    });
})();
//# sourceMappingURL=example.js.map