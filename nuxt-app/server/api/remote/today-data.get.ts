import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    // Validate API key
    const apiKey = getHeader(event, 'x-api-key') || getQuery(event).apiKey
    if (!apiKey) {
      throw createError({
        statusCode: 401,
        statusMessage: 'API key is required'
      })
    }
    
    // Verify API key
    const user = await prisma.user.findFirst({
      where: {
        apikey: apiKey as string,
        isDeleted: false
      }
    })
    
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid API key'
      })
    }
    
    // Get today's date range
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999)
    
    // Get cases created today
    const createdToday = await prisma.courtCase.findMany({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay
        },
        isDeleted: false
      },
      select: {
        id: true,
        uuid: true,
        registrationNumber: true,
        caseNumber: true,
        incomingNumber: true,
        receiptDate: true,
        claimant: true,
        debtor: true,
        debtAmount: true,
        decision: true,
        courtName: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    })
    
    // Get cases updated today (but not created today)
    const updatedToday = await prisma.courtCase.findMany({
      where: {
        updatedAt: {
          gte: startOfDay,
          lte: endOfDay
        },
        createdAt: {
          lt: startOfDay
        },
        isDeleted: false
      },
      select: {
        id: true,
        uuid: true,
        registrationNumber: true,
        caseNumber: true,
        incomingNumber: true,
        receiptDate: true,
        claimant: true,
        debtor: true,
        debtAmount: true,
        decision: true,
        courtName: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { updatedAt: 'desc' }
    })
    
    return {
      success: true,
      data: {
        createdToday: {
          count: createdToday.length,
          cases: createdToday
        },
        updatedToday: {
          count: updatedToday.length,
          cases: updatedToday
        },
        summary: {
          totalCreated: createdToday.length,
          totalUpdated: updatedToday.length,
          date: today.toISOString().split('T')[0]
        }
      }
    }
    
  } catch (error: any) {
    console.error('Error retrieving today\'s data:', error)
    
    if (error?.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
