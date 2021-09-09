# Basic usage
```typescript
const q = new Queue()

const job = q.createJob()
    .step(async () => {
      console.log('job 3 step 1')
      return 21;
    })
    .step(() => {
      console.log('job 3 step 2')
      return 11;
    })
    .step((result) => {
      console.log('job 3 step 3', result)
      return 22;
    })
    .start();

  q.getJob(job.jobId)
    ?.getObserver()
    .subscribe((res) => {
      console.log(res);
    })
```

# Using with nest
## Nest service
```typescript
// app.service.ts
@Injectable()
export class AppService implements OnModuleInit {

  q: Queue;

  onModuleInit() {
    this.q = new Queue()
  }

  createTimeoutTask() {
    return this.q.createJob()
      .step(async () => {
        await new Promise((resolve) => {
          setTimeout(resolve, 15000)
        })
      })
      .start()
  }
}
```

## Nest controller
```typescript
// app.controller.ts
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  createTask(): {jobId: string} {
    return this.appService.createTimeoutTask()
  }

  @Get(':id')
  getStatus(@Param('id') id): any {
    return this.appService.q.getJob(id)?.toPromise()
  }
}
```
# Using with Observable
```typescript
const job1 = q
  .createJob()
  .step(
    () =>
      new Observable((subscriber) => {
        subscriber.next(100);
      }),
  )
  .step((self) => {
    console.log('job 1 step 2', self.getPreviousResult());
    return 11;
  })
  .step(() => {
    console.log('job 1 step 3');
    return 12;
  })
  .step(self) => self.setPercent(100))
  .start();

q.getJob(job1.jobId)
  ?.getObserver()
  .subscribe((res) => {
    console.log(res);
  });
```

## Calculate the percentage manually
```typescript
  const job1 = q.createJob({
    calculatePercent: false
  })
    .step(self => {
        self.setPercent(123123);
      console.log("job 1 step 1");
      return 11;
    })
    .step(() => {
      console.log("job 1 step 2");
      return 12;
    })
    .step(() => {
      console.log("job 1 step 3");
      return 13;
    })
    .step(self) => self.setPercent(100))
    .start();
```

## Catching errors
```typescript
const job1 = q
    .createJob()
    .step(
        () =>
            new Observable((subscriber) => {
                subscriber.next(100);
            }),
    )
    .step((self) => {
        console.log('job 1 step 2', self.getPreviousResult());
        return 11;
    })
    .step(() => {
        console.log('job 1 step 3');
        throw new Error('Test error');
        return 12;
    })
    .step(self) => self.setPercent(100))
    .catch((error, self, step) => {
        console.log('error', error, step);
        switch (step) {
            case 1: {
                // ... code
                break;
            }
        }
    })
    .start();
```

## Send custom data
```typescript
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
  .catch((error, self, i) => {
    console.log('error', error, i);
  })
  .start();
```

## Return data from complete callback
```typescript
   q
    .createJob()
    .complete((self) => self.getPreviousResult())
```

## Get step result by step number
```typescript
   q
    .createJob()
    .step((self: IStepContext) => {
        console.log('step 2 data:', self.getPreviousResult(2));
        self.setPercent(100);
        return { test: 123 };
    })
```

# Parallel execution
To determine how tasks are executed and to adjust the load in the Queue constructor you can pass the number of tasks that can be executed asynchronously

```typescript
const q = new Queue(5)
```

