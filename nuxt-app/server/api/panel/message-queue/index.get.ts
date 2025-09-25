import { scheduledMessagesQueue } from "../../../utils/redis";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 10;
    const status = query.status as string || 'all';

    // Get jobs based on status
    let jobs;
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    if (status === 'active') {
      jobs = await scheduledMessagesQueue.getActive(start, end);
    } else if (status === 'waiting') {
      jobs = await scheduledMessagesQueue.getWaiting(start, end);
    } else if (status === 'completed') {
      jobs = await scheduledMessagesQueue.getCompleted(start, end);
    } else if (status === 'failed') {
      jobs = await scheduledMessagesQueue.getFailed(start, end);
    } else {
      // Get all jobs (this is a simplified approach)
      const active = await scheduledMessagesQueue.getActive(0, 100);
      const waiting = await scheduledMessagesQueue.getWaiting(0, 100);
      const completed = await scheduledMessagesQueue.getCompleted(0, 100);
      const failed = await scheduledMessagesQueue.getFailed(0, 100);
      jobs = [...active, ...waiting, ...completed, ...failed];
    }

    // Get total counts
    const counts = await scheduledMessagesQueue.getJobCounts();

    return {
      success: true,
      data: jobs.slice(start, end + 1),
      pagination: {
        page,
        limit,
        total: counts.active + counts.waiting + counts.completed + counts.failed,
        counts
      }
    };
  } catch (error) {
    console.error('Error fetching message queue:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    });
  }
});
