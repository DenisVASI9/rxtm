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
  .step((self) => {
    console.log('job 1 step 3', self.getPreviousResult());
    throw new Error('Test error');
    return 12;
  })
  .step((self: IStepContext) => {
    console.log('step 2 data:', self.getPreviousResult(2));
    self.setPercent(100);
    return { test: 123 };
  })
  // .complete((self) => self.getPreviousResult())
  .catch((error, self, i) => {
    console.log('error', error, i);
  })
  .start();

q.getJob(job1.jobId)
  ?.getObserver()
  .subscribe((res) => {
    console.log(res);
  });
