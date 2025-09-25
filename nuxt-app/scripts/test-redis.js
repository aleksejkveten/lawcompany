import { config } from 'dotenv';
import { Queue } from 'bullmq';

config();

async function testRedis() {
  try {
    console.log('Testing Redis connection and BullMQ queue...');

const connection = {
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD
}
  
  const testQueue = new Queue('test-scheduled-messages', { connection })

    // Add a test job
    const job = await testQueue.add('test', { message: 'Hello Redis!' });
    console.log('Job added successfully with ID:', job.id);

    // Set up a worker to process the job
    testQueue.process('test', async (job) => {
      console.log('Processing job:', job.data);
      return 'Job processed successfully';
    });

    // Wait for the job to be processed
    setTimeout(async () => {
      console.log('Test completed. Closing queue...');
      await testQueue.close();
      process.exit(0);
    }, 3000);

  } catch (error) {
    console.error('Error during Redis test:', error);
    process.exit(1);
  }
}

testRedis();
