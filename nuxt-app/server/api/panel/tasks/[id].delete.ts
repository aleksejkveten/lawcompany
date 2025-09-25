// API endpoint для удаления задачи (мягкое удаление)
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

    // Проверяем существование задачи
    const existingTask = await prisma.task.findUnique({
      where: { id }
    })

    if (!existingTask || existingTask.isDeleted) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Task not found'
      })
    }

    // Мягкое удаление задачи
    await prisma.task.update({
      where: { id },
      data: {
        isDeleted: true,
        updatedAt: new Date()
      }
    })

    return {
      success: true,
      message: 'Task deleted successfully'
    }

  } catch (error) {
    console.error('Error deleting task:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to delete task'
    })
  }
})
