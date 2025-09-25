import { scheduledMessagesQueue } from "../../../utils/redis";

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id');

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Job ID is required'
      });
    }

    // Get job by ID
    const job = await scheduledMessagesQueue.getJob(id);

    if (!job) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Job not found'
      });
    }

    return {
      success: true,
      data: {
        id: job.id,
        name: job.name,
        data: job.data,
        opts: job.opts,
        progress: job.progress,
        attemptsMade: job.attemptsMade,
        finishedOn: job.finishedOn,
        processedOn: job.processedOn,
        failedReason: job.failedReason,
        returnvalue: job.returnvalue
      }
    };
  } catch (error: any) {
    console.error('Error fetching message queue job:', error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    });
  }
});
