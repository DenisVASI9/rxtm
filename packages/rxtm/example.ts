import { Queue } from './classes/Queue';
import { Observable } from 'rxjs';

const q = new Queue(4);

const job1 = q
  .createJob()
  .step(() => new Observable((subscriber) => {
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

q.getJob(job1.jobId)
  ?.getObserver()
  .subscribe((res) => {
    console.log(res);
  });
