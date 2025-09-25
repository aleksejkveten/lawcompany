// API endpoint для получения списка категорий задач
import prisma from "../../../../lib/prisma";

export default defineEventHandler(async (event) => {
  try {
    // Получаем параметры запроса
    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 10
    const search = query.search as string || ''

    const skip = (page - 1) * limit

    // Создаем условие поиска
    const where: any = {
      isDeleted: false,
      ...(search && {
        name: { contains: search }
      })
    }

    // Получаем категории задач с пагинацией
    const [taskActions, total] = await Promise.all([
      prisma.taskAction.findMany({
        where,
        include: {
          _count: {
            select: {
              tasks: { where: { isDeleted: false } }
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.taskAction.count({ where })
    ])

    return {
      success: true,
      data: taskActions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }

  } catch (error) {
    console.error('Error fetching task actions:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch task actions'
    })
  }
})
