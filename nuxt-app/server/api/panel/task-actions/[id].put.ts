// API endpoint для обновления категории задач
import prisma from "../../../../lib/prisma";

export default defineEventHandler(async (event) => {
  try {
    const id = parseInt(event.context.params?.id as string)
    const body = await readBody(event)

    if (!id || isNaN(id)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid task action ID'
      })
    }

    // Проверяем существование категории
    const existingAction = await prisma.taskAction.findUnique({
      where: { id }
    })

    if (!existingAction || existingAction.isDeleted) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Task action not found'
      })
    }

    // Валидация входных данных
    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || body.name.trim() === '') {
        throw createError({
          statusCode: 400,
          statusMessage: 'Name must be a non-empty string'
        })
      }

      // Проверяем, существует ли уже такая категория с другим ID
      const duplicateAction = await prisma.taskAction.findFirst({
        where: {
          name: body.name.trim(),
          isDeleted: false,
          id: { not: id }
        }
      })

      if (duplicateAction) {
        throw createError({
          statusCode: 409,
          statusMessage: 'Task action with this name already exists'
        })
      }
    }

    // Подготавливаем данные для обновления
    const updateData: any = {}

    if (body.name !== undefined) updateData.name = body.name.trim()
    updateData.updatedAt = new Date()

    // Обновляем категорию задач
    const taskAction = await prisma.taskAction.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: {
            tasks: { where: { isDeleted: false } }
          }
        }
      }
    })

    return {
      success: true,
      data: taskAction
    }

  } catch (error) {
    console.error('Error updating task action:', error)
    const err = error as { statusCode?: number; statusMessage?: string }
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to update task action'
    })
  }
})
