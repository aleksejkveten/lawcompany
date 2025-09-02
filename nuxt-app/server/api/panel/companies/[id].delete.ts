// API endpoint для удаления компании (мягкое удаление)
import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const companyId = getRouterParam(event, 'id')
    
    if (!companyId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Company ID is required'
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
    
    // Проверяем, есть ли связанные судебные дела
    const courtCasesCount = await prisma.courtCase.count({
      where: {
        OR: [
          { claimantCompanyId: parseInt(companyId) },
          { debtorCompanyId: parseInt(companyId) }
        ],
        isDeleted: false
      }
    })
    
    if (courtCasesCount > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Cannot delete company with associated court cases'
      })
    }
    
    // Мягкое удаление компании и всех связанных сущностей
    await prisma.$transaction(async (tx) => {
      // Удаляем компанию
      await tx.company.update({
        where: { id: parseInt(companyId) },
        data: { 
          isDeleted: true, 
          updatedAt: new Date() 
        }
      })
      
      // Удаляем контактные лица
      await tx.contactPerson.updateMany({
        where: { companyId: parseInt(companyId) },
        data: { 
          isDeleted: true, 
          updatedAt: new Date() 
        }
      })
      
      // Получаем все контактные лица компании для удаления телефонов и email
      const contactPersons = await tx.contactPerson.findMany({
        where: { companyId: parseInt(companyId) },
        select: { id: true }
      })
      
      const contactPersonIds = contactPersons.map(cp => cp.id)
      
      if (contactPersonIds.length > 0) {
        // Удаляем телефоны
        await tx.phone.updateMany({
          where: { contactPersonId: { in: contactPersonIds } },
          data: { 
            isDeleted: true, 
            updatedAt: new Date() 
          }
        })
        
        // Удаляем email
        await tx.email.updateMany({
          where: { contactPersonId: { in: contactPersonIds } },
          data: { 
            isDeleted: true, 
            updatedAt: new Date() 
          }
        })
      }
    })
    
    return {
      success: true,
      message: 'Company deleted successfully'
    }
    
  } catch (error: any) {
    console.error('Error deleting company:', error)
    
    if (error?.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete company'
    })
  }
})
