// workers/notification.worker.ts
import { Worker } from 'bullmq';
import { Redis } from 'ioredis';

const connection = new Redis();

const worker = new Worker('notifications', async (job) => {
    console.log(job)
}, { connection });

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed: ${err.message}`);
});
