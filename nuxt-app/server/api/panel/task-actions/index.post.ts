// API endpoint для создания новой категории задач
import prisma from "../../../../lib/prisma";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    // Валидация входных данных
    if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Name is required and must be a non-empty string'
      })
    }

    // Проверяем, существует ли уже такая категория
    const existingAction = await prisma.taskAction.findFirst({
      where: {
        name: body.name.trim(),
        isDeleted: false
      }
    })

    if (existingAction) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Task action with this name already exists'
      })
    }

    // Создаем категорию задач
    const taskAction = await prisma.taskAction.create({
      data: {
        name: body.name.trim()
      },
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
    console.error('Error creating task action:', error)
    const err = error as { statusCode?: number; statusMessage?: string }
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to create task action'
    })
  }
})
