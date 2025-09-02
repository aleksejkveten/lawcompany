// API endpoint для получения судебного дела по ID
import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const courtCaseId = getRouterParam(event, 'id')
    
    if (!courtCaseId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Court case ID is required'
      })
    }
    
    const courtCase = await prisma.courtCase.findUnique({
        where: {
          id: parseInt(courtCaseId),
          isDeleted: false
        },
        include: {
          claimantCompany: {
            select: { 
              id: true, 
              name: true, 
              unp: true,
              contactPersons: {
                where: { isDeleted: false },
                include: {
                  phones: { where: { isDeleted: false } },
                  emails: { where: { isDeleted: false } }
                }
              }
            }
          },
          debtorCompany: {
            select: { 
              id: true, 
              name: true, 
              unp: true,
              contactPersons: {
                where: { isDeleted: false },
                include: {
                  phones: { where: { isDeleted: false } },
                  emails: { where: { isDeleted: false } }
                }
              }
            }
          }
        }
      })
      
      if (!courtCase) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Court case not found'
        })
      }
      
    return {
      success: true,
      data: courtCase
    }
    
  } catch (error: any) {
    console.error('Error fetching court case:', error)
    
    if (error?.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch court case'
    })
  }
})
