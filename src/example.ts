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

  // const job2 = q.createJob()
  //   .step(async () => {
  //     console.log("job 2 step 1");
  //     return 21;
  //   })
  //   .step(() => {
  //     console.log("job 2 step 2");
  //     throw new Error("sasdfsadfsadf");
  //     return 11;
  //   })
  //   .step((result) => {
  //     console.log("job 2 step 3", result);
  //     return 22;
  //   })
  //   .start();

  // const job3 = q.createJob()
  //   .step(async () => {
  //     console.log("job 3 step 1");
  //     return 21;
  //   })
  //   .step(() => {
  //     console.log("job 3 step 2");
  //     return 11;
  //   })
  //   .step((result) => {
  //     console.log("job 3 step 3", result);
  //     return 22;
  //   })
  //   .start();

  // q.getJob(job2.jobId)
  //   ?.getObserver()
  //   .subscribe((res) => {
  //     console.log("jobID:", res);
  //   });

})();
