import prisma from "../../../../lib/prisma";

export default defineEventHandler(async (event) => {
  try {
    // Get recent activities
    const [recentCases, recentCompanies, recentUsers] = await Promise.all([
      // Recent court cases
      prisma.courtCase.findMany({
        where: { isDeleted: false },
        select: {
          id: true,
          claimant: true,
          debtor: true,
          caseNumber: true,
          debtAmount: true,
          courtName: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      
      // Recent companies
      prisma.company.findMany({
        where: { isDeleted: false },
        select: {
          id: true,
          name: true,
          unp: true,
          createdAt: true,
          _count: {
            select: {
              courtCasesAsClaimant: { where: { isDeleted: false } },
              courtCasesAsDebtor: { where: { isDeleted: false } }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      
      // Recent users
      prisma.user.findMany({
        where: { isDeleted: false },
        select: {
          id: true,
          name: true,
          email: true,
          roles: true,
          apikey: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ])

    return {
      success: true,
      data: {
        recentCases,
        recentCompanies,
        recentUsers
      }
    }
  } catch (error: any) {
    console.error('Error fetching recent activities:', error)
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Ошибка при получении последних действий'
    })
  }
})
