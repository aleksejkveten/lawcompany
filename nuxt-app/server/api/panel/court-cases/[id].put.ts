// API endpoint для обновления судебного дела
import prisma from "../../../utils/prisma";

export default defineEventHandler(async (event) => {
  try {
    const courtCaseId = getRouterParam(event, 'id')
    const body = await readBody(event)
    
    if (!courtCaseId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Court case ID is required'
      })
    }
    
    // Валидация обязательных полей
    const requiredFields = ['claimant', 'debtor', 'incomingNumber', 'courtName']
    
    for (const field of requiredFields) {
      if (!body[field]) {
        throw createError({
          statusCode: 400,
          statusMessage: `Field ${field} is required`
        })
      }
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
      
      // Обновляем судебное дело
      const courtCase = await prisma.courtCase.update({
        where: { id: parseInt(courtCaseId) },
        data: {
          claimant: body.claimant,
          claimantCompanyId: body.claimantCompanyId || null,
          debtor: body.debtor,
          debtorCompanyId: body.debtorCompanyId || null,
          registrationNumber: body.registrationNumber || '',
          caseNumber: body.caseNumber || null,
          incomingNumber: body.incomingNumber,
          receiptDate: body.receiptDate ? new Date(body.receiptDate) : null,
          debtAmount: body.debtAmount ? parseFloat(body.debtAmount) : null,
          decision: body.decision || null,
          courtName: body.courtName,
          notes: body.notes || null,
          track: body.track || false,
          updatedAt: new Date()
        },
        include: {
          claimantCompany: {
            select: { id: true, name: true, unp: true }
          },
          debtorCompany: {
            select: { id: true, name: true, unp: true }
          }
        }
      })
      
    return {
      success: true,
      data: courtCase,
      message: 'Court case updated successfully'
    }
    
  } catch (error: any) {
    console.error('Error updating court case:', error)
    
    if (error?.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update court case'
    })
  }
})
