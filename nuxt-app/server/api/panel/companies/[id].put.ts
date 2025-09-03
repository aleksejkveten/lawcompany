// API endpoint для обновления компании
import prisma from "../../../../lib/prisma";

export default defineEventHandler(async (event) => {
  try {
    const companyId = getRouterParam(event, 'id')
    const body = await readBody(event)
    
    if (!companyId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Company ID is required'
      })
    }
    
    if (!body.name) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Company name is required'
      })
    }
    
    // Проверяем существование компании
    const existingCompany = await prisma.company.findUnique({
      where: { id: parseInt(companyId), isDeleted: false }
    })
      
      if (!existingCompany) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Company not found'
        })
      }
      
      // Обновляем компанию
      const company = await prisma.company.update({
        where: { id: parseInt(companyId) },
        data: {
          name: body.name,
          unp: body.unp || null,
          updatedAt: new Date()
        },
        include: {
          contactPersons: {
            where: { isDeleted: false },
            include: {
              phones: { where: { isDeleted: false } },
              emails: { where: { isDeleted: false } }
            }
          }
        }
      })
      
    return {
      success: true,
      data: company,
      message: 'Company updated successfully'
    }
    
  } catch (error: any) {
    console.error('Error updating company:', error)
    
    if (error?.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update company'
    })
  }
})
