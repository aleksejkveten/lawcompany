import { scheduledMessagesQueue } from "../../../utils/redis";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    // Validate required fields
    if (!body.type || !['sms', 'email'].includes(body.type)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Type must be either "sms" or "email"'
      });
    }

    if (!body.templateId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Template ID is required'
      });
    }

    if (!body.companyId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Company ID is required'
      });
    }

    if (!body.scheduledAt) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Scheduled date is required'
      });
    }

    // Add job to queue
    const job = await scheduledMessagesQueue.add(
      `send-${body.type}`,
      {
        type: body.type,
        templateId: body.templateId,
        companyId: body.companyId,
        scheduledAt: body.scheduledAt,
        channel: body.channel || null
      },
      {
        delay: new Date(body.scheduledAt).getTime() - Date.now(),
        jobId: body.key || undefined
      }
    );

    return {
      success: true,
      data: {
        id: job.id,
        name: job.name,
        data: job.data,
        opts: job.opts
      }
    };
  } catch (error: any) {
    console.error('Error creating message queue job:', error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    });
  }
});
