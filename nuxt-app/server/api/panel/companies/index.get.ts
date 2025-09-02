// API endpoint для получения списка компаний
import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    // Получаем параметры запроса
    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 10
    const search = query.search as string || ''
    
    const skip = (page - 1) * limit
    
    // Инициализируем Prisma клиент
    
    // Создаем условие поиска
      const where = {
        isDeleted: false,
        ...(search && {
          OR: [
            { name: { contains: search } },
            { unp: { contains: search } }
          ]
        })
      }
      
      // Получаем компании с пагинацией
      const [companies, total] = await Promise.all([
        prisma.company.findMany({
          where,
          include: {
            contactPersons: {
              where: { isDeleted: false },
              include: {
                phones: { where: { isDeleted: false } },
                emails: { where: { isDeleted: false } }
              }
            },
            _count: {
              select: {
                courtCasesAsClaimant: { where: { isDeleted: false } },
                courtCasesAsDebtor: { where: { isDeleted: false } }
              }
            }
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' }
        }),
        prisma.company.count({ where })
      ])
      
    return {
      success: true,
      data: companies,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
    
  } catch (error) {
    console.error('Error fetching companies:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch companies'
    })
  }
})
