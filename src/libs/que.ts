// queues/notification.queue.ts
import { Queue } from 'bullmq';
import { Redis } from 'ioredis';

const connection = new Redis();

export const notificationQueue = new Queue('notifications', { connection });
// export const notificationQueue : any;
