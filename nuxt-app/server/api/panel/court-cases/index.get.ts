// API endpoint для получения списка судебных дел
import prisma from "../../../../lib/prisma";

export default defineEventHandler(async (event) => {
  try {
    // Получаем параметры запроса
    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 10
    const search = query.search as string || ''
    const dateAddedFrom = query.dateAddedFrom as string
    const dateAddedTo = query.dateAddedTo as string
    const dateCreatedFrom = query.dateCreatedFrom as string
    const dateCreatedTo = query.dateCreatedTo as string
    
    const skip = (page - 1) * limit
    
    // Инициализируем Prisma клиент
    
    // Создаем условие поиска
      const where: any = {
        isDeleted: false,
        ...(search && {
          OR: [
            { claimant: { contains: search } },
            { debtor: { contains: search } },
            { caseNumber: { contains: search } },
            { registrationNumber: { contains: search } },
            { incomingNumber: { contains: search } },
            { courtName: { contains: search } }
          ]
        })
      }
      
      // Добавляем фильтры по датам
      if (dateAddedFrom || dateAddedTo) {
        where.createdAt = {}
        if (dateAddedFrom) {
          where.createdAt.gte = new Date(dateAddedFrom + 'T00:00:00.000Z')
        }
        if (dateAddedTo) {
          where.createdAt.lte = new Date(dateAddedTo + 'T23:59:59.999Z')
        }
      }
      
      if (dateCreatedFrom || dateCreatedTo) {
        where.receiptDate = {}
        if (dateCreatedFrom) {
          where.receiptDate.gte = new Date(dateCreatedFrom + 'T00:00:00.000Z')
        }
        if (dateCreatedTo) {
          where.receiptDate.lte = new Date(dateCreatedTo + 'T23:59:59.999Z')
        }
      }
      
      // Получаем судебные дела с пагинацией
      const [courtCases, total] = await Promise.all([
        prisma.courtCase.findMany({
          where,
          include: {
            claimantCompany: {
              select: { id: true, name: true, unp: true }
            },
            debtorCompany: {
              select: { id: true, name: true, unp: true }
            }
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' }
        }),
        prisma.courtCase.count({ where })
      ])
      
    return {
      success: true,
      data: courtCases,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
    
  } catch (error) {
    console.error('Error fetching court cases:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch court cases'
    })
  }
})
