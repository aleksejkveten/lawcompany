// API endpoint для создания нового судебного дела
import { prisma } from '../../../utils/prisma'
import { randomUUID } from 'crypto'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    // Валидация обязательных полей
    const requiredFields = [
      'claimant', 'debtor', 'registrationNumber', 'caseNumber', 
      'incomingNumber', 'receiptDate', 'debtAmount', 'decision', 'courtName'
    ]
    
    for (const field of requiredFields) {
      if (!body[field]) {
        throw createError({
          statusCode: 400,
          statusMessage: `Field ${field} is required`
        })
      }
    }
    
    // Создаем судебное дело
      const courtCase = await prisma.courtCase.create({
        data: {
          uuid: randomUUID(),
          claimant: body.claimant,
          claimantCompanyId: body.claimantCompanyId || null,
          debtor: body.debtor,
          debtorCompanyId: body.debtorCompanyId || null,
          registrationNumber: body.registrationNumber,
          caseNumber: body.caseNumber,
          incomingNumber: body.incomingNumber,
          receiptDate: new Date(body.receiptDate),
          debtAmount: parseFloat(body.debtAmount),
          decision: body.decision,
          courtName: body.courtName
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
      message: 'Court case created successfully'
    }
    
  } catch (error: any) {
    console.error('Error creating court case:', error)
    
    if (error?.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create court case'
    })
  }
})