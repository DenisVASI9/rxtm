import { Queue } from './classes/Queue';
import { Observable } from 'rxjs';
import { IStepContext } from './types';

const q = new Queue(4);

const job1 = q
  .createJob()
  .step(
    () =>
      new Observable((subscriber) => {
        subscriber.next(100);
      }),
  )
  .step((self) => {
    const r = self.getPreviousResult();
    console.log('job 1 step 2', r);
    return 11;
  })
  .step(() => {
    console.log('job 1 step 3');
    // throw new Error('Test error');
    return 12;
  })
  .step((self: IStepContext) => self.setPercent(100))
  .complete((self) => {
    self.sendData({ data: 123 });
  })
  .catch((error, i) => {
    console.log('error', error, i);
  })
  .start();

q.getJob(job1.jobId)
  ?.getObserver()
  .subscribe((res) => {
    console.log(res);
  });
