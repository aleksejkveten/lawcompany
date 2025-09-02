// API endpoint для удаления судебного дела (мягкое удаление)
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
    
    // Проверяем существование судебного дела
      const existingCourtCase = await prisma.courtCase.findUnique({
        where: { id: parseInt(courtCaseId), isDeleted: false }
      })
      
      if (!existingCourtCase) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Court case not found'
        })
      }
      
      // Мягкое удаление судебного дела
      await prisma.courtCase.update({
        where: { id: parseInt(courtCaseId) },
        data: { 
          isDeleted: true, 
          updatedAt: new Date() 
        }
      })
      
    return {
      success: true,
      message: 'Court case deleted successfully'
    }
    
  } catch (error: any) {
    console.error('Error deleting court case:', error)
    
    if (error?.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete court case'
    })
  }
})
