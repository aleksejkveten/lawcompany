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

    // Remove job from queue
    await job.remove();

    return {
      success: true,
      message: 'Job deleted successfully'
    };
  } catch (error: any) {
    console.error('Error deleting message queue job:', error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    });
  }
});
