// API endpoint для получения компании по ID
import prisma from "../../../../lib/prisma";

export default defineEventHandler(async (event) => {
  try {
    const companyId = getRouterParam(event, 'id')
    
    if (!companyId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Company ID is required'
      })
    }
    
    const company = await prisma.company.findUnique({
      where: {
        id: parseInt(companyId),
        isDeleted: false
      },
      include: {
        contactPersons: {
          where: { isDeleted: false },
          include: {
            phones: { where: { isDeleted: false } },
            emails: { where: { isDeleted: false } }
          }
        },
        courtCasesAsClaimant: {
          where: { isDeleted: false },
          select: { id: true, caseNumber: true, debtAmount: true, createdAt: true }
        },
        courtCasesAsDebtor: {
          where: { isDeleted: false },
          select: { id: true, caseNumber: true, debtAmount: true, createdAt: true }
        }
      }
    })
    
    if (!company) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Company not found'
      })
    }
    
    return {
      success: true,
      data: company
    }
    
  } catch (error: any) {
    console.error('Error fetching company:', error)
    
    if (error?.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch company'
    })
  }
})
