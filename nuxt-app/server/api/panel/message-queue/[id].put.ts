import { scheduledMessagesQueue } from "../../../utils/redis";

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id');
    const body = await readBody(event);

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Job ID is required'
      });
    }

    // Get existing job
    const job = await scheduledMessagesQueue.getJob(id);

    if (!job) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Job not found'
      });
    }

    // Since BullMQ jobs are immutable, we need to recreate the job
    const updatedData = {
      type: body.type || job.data.type,
      templateId: body.templateId || job.data.templateId,
      companyId: body.companyId || job.data.companyId,
      scheduledAt: body.scheduledAt || job.data.scheduledAt,
      channel: body.channel !== undefined ? body.channel : job.data.channel
    };

    // Remove old job
    await job.remove();

    // Create new job with updated data
    const newJob = await scheduledMessagesQueue.add(
      job.name,
      updatedData,
      {
        delay: new Date(updatedData.scheduledAt).getTime() - Date.now(),
        jobId: id // Keep same ID
      }
    );

    return {
      success: true,
      data: {
        id: newJob.id,
        name: newJob.name,
        data: newJob.data,
        opts: newJob.opts
      }
    };
  } catch (error: any) {
    console.error('Error updating message queue job:', error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    });
  }
});
