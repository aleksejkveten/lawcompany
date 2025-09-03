// API endpoint для получения списка компаний для выпадающих списков
import prisma from "../../../../lib/prisma";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const search = query.search as string || ''
    
    const companies = await prisma.company.findMany({
        where: {
          isDeleted: false,
          ...(search && {
            name: { contains: search }
          })
        },
        select: {
          id: true,
          name: true,
          unp: true
        },
        orderBy: { name: 'asc' },
        take: 50 // Ограничиваем количество для производительности
      })
      
    return {
      success: true,
      data: companies
    }
    
  } catch (error) {
    console.error('Error fetching companies list:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch companies list'
    })
  }
})
