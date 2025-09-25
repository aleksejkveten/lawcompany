// API endpoint для получения задачи по ID
import prisma from "../../../../lib/prisma";

export default defineEventHandler(async (event) => {
  try {
    const id = parseInt(event.context.params?.id as string)

    if (!id || isNaN(id)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid task ID'
      })
    }

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        action: true,
        company: true,
        contactPerson: true,
        phone: true,
        courtCase: true,
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!task || task.isDeleted) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Task not found'
      })
    }

    return {
      success: true,
      data: task
    }

  } catch (error) {
    console.error('Error fetching task:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to fetch task'
    })
  }
})
