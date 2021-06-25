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

  q.getJob(job.getId())
    ?.getObserver()
    .subscribe((res) => {
      console.log(res);
    })
```

# Usage with nest
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

# Parallel execution
To determine how tasks are executed and to adjust the load in the Queue constructor you can pass the number of tasks that can be executed asynchronously

```typescript
const q = new Queue(5)
```
