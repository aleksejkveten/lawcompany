// API endpoint для создания новой задачи
import prisma from "../../../../lib/prisma";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    // Валидация входных данных
    const requiredFields = ['title', 'actionId', 'companyId', 'contactPersonId', 'phoneId', 'assignedToId']
    for (const field of requiredFields) {
      if (!body[field]) {
        throw createError({
          statusCode: 400,
          statusMessage: `Missing required field: ${field}`
        })
      }
    }

    // Создаем задачу
    const task = await prisma.task.create({
      data: {
        title: body.title,
        description: body.description,
        actionId: parseInt(body.actionId),
        status: body.status || 'pending',
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
        courtCaseId: body.courtCaseId ? parseInt(body.courtCaseId) : null,
        companyId: parseInt(body.companyId),
        contactPersonId: parseInt(body.contactPersonId),
        phoneId: parseInt(body.phoneId),
        assignedToId: parseInt(body.assignedToId),
        notes: body.notes
      },
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
    console.error('Error creating task:', error)
    const err = error as { statusCode?: number; statusMessage?: string }
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to create task'
    })
  }
})
