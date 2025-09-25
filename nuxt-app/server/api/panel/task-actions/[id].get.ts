// API endpoint для получения категории задач по ID
import prisma from "../../../../lib/prisma";

export default defineEventHandler(async (event) => {
  try {
    const id = parseInt(event.context.params?.id as string)

    if (!id || isNaN(id)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid task action ID'
      })
    }

    const taskAction = await prisma.taskAction.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            tasks: { where: { isDeleted: false } }
          }
        }
      }
    })

    if (!taskAction || taskAction.isDeleted) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Task action not found'
      })
    }

    return {
      success: true,
      data: taskAction
    }

  } catch (error) {
    console.error('Error fetching task action:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to fetch task action'
    })
  }
})
