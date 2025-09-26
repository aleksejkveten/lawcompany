// API endpoint для удаления категории задач (мягкое удаление)
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

    // Проверяем существование категории
    const existingAction = await prisma.taskAction.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            tasks: { where: { isDeleted: false } }
          }
        }
      }
    })

    if (!existingAction || existingAction.isDeleted) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Task action not found'
      })
    }

    // Проверяем, есть ли связанные задачи
    if (existingAction._count.tasks > 0) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Cannot delete task action that has associated tasks'
      })
    }

    // Мягкое удаление категории задач
    await prisma.taskAction.update({
      where: { id },
      data: {
        isDeleted: true,
        updatedAt: new Date()
      }
    })

    return {
      success: true,
      message: 'Task action deleted successfully'
    }

  } catch (error) {
    console.error('Error deleting task action:', error)
    const err = error as { statusCode?: number; statusMessage?: string }
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to delete task action'
    })
  }
})
