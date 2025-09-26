// API endpoint для обновления задачи
import prisma from "../../../../lib/prisma";

export default defineEventHandler(async (event) => {
  try {
    const id = parseInt(event.context.params?.id as string)
    const body = await readBody(event)

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

    // Подготавливаем данные для обновления
    const updateData: any = {}

    if (body.title !== undefined) updateData.title = body.title
    if (body.description !== undefined) updateData.description = body.description
    if (body.actionId !== undefined) updateData.actionId = parseInt(body.actionId)
    if (body.status !== undefined) {
      updateData.status = body.status
      if (body.status === 'completed') {
        updateData.completedAt = new Date()
      } else {
        updateData.completedAt = null
      }
    }
    if (body.scheduledAt !== undefined) updateData.scheduledAt = body.scheduledAt ? new Date(body.scheduledAt) : null
    if (body.courtCaseId !== undefined) updateData.courtCaseId = body.courtCaseId ? parseInt(body.courtCaseId) : null
    if (body.companyId !== undefined) updateData.companyId = parseInt(body.companyId)
    if (body.contactPersonId !== undefined) updateData.contactPersonId = parseInt(body.contactPersonId)
    if (body.phoneId !== undefined) updateData.phoneId = parseInt(body.phoneId)
    if (body.assignedToId !== undefined) updateData.assignedToId = parseInt(body.assignedToId)
    if (body.notes !== undefined) updateData.notes = body.notes

    updateData.updatedAt = new Date()

    // Обновляем задачу
    const task = await prisma.task.update({
      where: { id },
      data: updateData,
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

    return {
      success: true,
      data: task
    }

  } catch (error) {
    console.error('Error updating task:', error)
    const err = error as { statusCode?: number; statusMessage?: string }
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to update task'
    })
  }
})
