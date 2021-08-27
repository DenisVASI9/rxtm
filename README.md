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
  .step((res) => {
    console.log('job 1 step 2', res);
    return 11;
  })
  .step(() => {
    console.log('job 1 step 3');
    return 12;
  })
  .step((_, { setPercent }) => setPercent(100))
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
    .step((_, { setPercent }) => {
      setPercent(123123);
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
    .step((_, { setPercent }) => setPercent(100))
    .start();
```

# Parallel execution
To determine how tasks are executed and to adjust the load in the Queue constructor you can pass the number of tasks that can be executed asynchronously

```typescript
const q = new Queue(5)
```

