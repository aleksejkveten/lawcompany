import { Queue } from 'bullmq';
import { useRuntimeConfig } from '#imports';

const config = useRuntimeConfig();

// Redis connection configuration
export const redisConnection = {
  host: config.redis.host,
  port: parseInt(config.redis.port),
  password: config.redis.password,
};

// Queue for scheduled messages
export const scheduledMessagesQueue = new Queue('scheduled-messages', {
  connection: redisConnection,
});

// Function to close the queue gracefully
export const closeQueues = async () => {
  await scheduledMessagesQueue.close();
};
