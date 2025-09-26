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
    const err = error as { statusCode?: number; statusMessage?: string }
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to delete task'
    })
  }
})
