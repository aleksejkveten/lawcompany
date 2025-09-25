// API endpoint для получения списка задач
import prisma from "../../../../lib/prisma";

export default defineEventHandler(async (event) => {
  try {
    // Получаем параметры запроса
    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 10
    const search = query.search as string || ''
    const status = query.status as string || 'pending' // pending, completed, cancelled

    const skip = (page - 1) * limit

    // Создаем условие поиска
    const where: any = {
      isDeleted: false,
      status: status === 'completed' ? 'completed' : { not: 'completed' }, // Для невыполненных задач
      ...(search && {
        OR: [
          { title: { contains: search } },
          { description: { contains: search } },
          { company: { name: { contains: search } } },
          { contactPerson: { name: { contains: search } } }
        ]
      })
    }

    // Получаем задачи с пагинацией
    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
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
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.task.count({ where })
    ])

    return {
      success: true,
      data: tasks,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }

  } catch (error) {
    console.error('Error fetching tasks:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch tasks'
    })
  }
})
