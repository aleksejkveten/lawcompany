import { prisma } from '../../../utils/prisma'
import { randomUUID } from 'crypto'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    // Validate API key
    const apiKey = getHeader(event, 'x-api-key') || body.apiKey
    if (!apiKey) {
      throw createError({
        statusCode: 401,
        statusMessage: 'API key is required'
      })
    }
    
    // Verify API key
    const user = await prisma.user.findFirst({
      where: {
        apikey: apiKey,
        isDeleted: false
      }
    })
    
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid API key'
      })
    }
    
    // Validate request data - expect either courtData or cases array
    const cases = body.cases || body.courtData
    if (!cases || !Array.isArray(cases)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Cases array is required'
      })
    }
    
    let created = 0
    let updated = 0
    let skipped = 0
    const errors: any[] = []
    
    // Process each court case
    for (const caseData of cases) {
      try {
        const result = await processCourtCase(caseData)
        if (result.isNew) {
          created++
        } else if (result.updated) {
          updated++
        } else {
          skipped++
        }
      } catch (error: any) {
        console.error('Error processing case:', error)
        errors.push({
          case: caseData.incomingNumber || 'Unknown',
          error: error.message
        })
        skipped++
      }
    }
    
    return {
      success: true,
      stats: {
        processed: cases.length,
        created,
        updated,
        skipped
      },
      errors: errors.length > 0 ? errors : undefined,
      message: `Processed: ${cases.length}, created: ${created}, updated: ${updated}, skipped: ${skipped}`
    }
    
  } catch (error: any) {
    console.error('Error processing court data:', error)
    
    if (error?.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})

// Helper function to process individual court case
async function processCourtCase(caseData: any) {
  // Validate required fields
  const requiredFields = ['incomingNumber', 'receiptDate', 'claimant', 'debtor']
  for (const field of requiredFields) {
    if (!caseData[field]) {
      throw new Error(`Missing required field: ${field}`)
    }
  }
  
  // Parse receipt date
  let receiptDate: Date
  try {
    receiptDate = new Date(caseData.receiptDate)
    if (isNaN(receiptDate.getTime())) {
      throw new Error('Invalid receipt date')
    }
  } catch {
    throw new Error('Invalid receipt date format')
  }
  
  // Look for existing case based on unique criteria
  const existingCase = await prisma.courtCase.findFirst({
    where: {
      incomingNumber: caseData.incomingNumber,
      receiptDate: receiptDate,
      claimant: caseData.claimant,
      debtor: caseData.debtor,
      isDeleted: false
    }
  })
  
  const casePayload = {
    uuid: existingCase?.uuid || randomUUID(),
    registrationNumber: caseData.caseNumber || caseData.registrationNumber || '',
    caseNumber: caseData.caseNumber || '',
    incomingNumber: caseData.incomingNumber,
    receiptDate: receiptDate,
    claimant: caseData.claimant,
    debtor: caseData.debtor,
    debtAmount: parseFloat(caseData.debtAmount) || 0,
    decision: caseData.decision || '',
    courtName: caseData.courtName || ''
  }
  
  if (existingCase) {
    // Update existing case if data has changed
    const hasChanges = (
      existingCase.registrationNumber !== casePayload.registrationNumber ||
      existingCase.caseNumber !== casePayload.caseNumber ||
      existingCase.debtAmount !== casePayload.debtAmount ||
      existingCase.decision !== casePayload.decision ||
      existingCase.courtName !== casePayload.courtName
    )
    
    if (hasChanges) {
      await prisma.courtCase.update({
        where: { id: existingCase.id },
        data: casePayload
      })
      return { isNew: false, updated: true }
    }
    
    return { isNew: false, updated: false }
  } else {
    // Create new case
    await prisma.courtCase.create({
      data: casePayload
    })
    return { isNew: true, updated: false }
  }
}
