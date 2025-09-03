import prisma from "../../../../lib/prisma";

export default defineEventHandler(async (event) => {
  try {
    // Get total counts
    const [
      totalUsers,
      totalCompanies,
      totalCourtCases,
      activeUsers,
      recentCourtCases,
      companiesWithCases,
      todaysCases,
      thisWeekCases,
      thisMonthCases
    ] = await Promise.all([
      // Total users
      prisma.user.count({
        where: { isDeleted: false }
      }),
      
      // Total companies
      prisma.company.count({
        where: { isDeleted: false }
      }),
      
      // Total court cases
      prisma.courtCase.count({
        where: { isDeleted: false }
      }),
      
      // Active users (with API keys)
      prisma.user.count({
        where: { 
          isDeleted: false,
          apikey: { not: null }
        }
      }),
      
      // Recent court cases (last 7 days)
      prisma.courtCase.count({
        where: {
          isDeleted: false,
          createdAt: {
            gte: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Companies with court cases
      prisma.company.count({
        where: {
          isDeleted: false,
          OR: [
            { courtCasesAsClaimant: { some: { isDeleted: false } } },
            { courtCasesAsDebtor: { some: { isDeleted: false } } }
          ]
        }
      }),
      
      // Today's cases
      prisma.courtCase.count({
        where: {
          isDeleted: false,
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      
      // This week's cases
      prisma.courtCase.count({
        where: {
          isDeleted: false,
          createdAt: {
            gte: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // This month's cases
      prisma.courtCase.count({
        where: {
          isDeleted: false,
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      })
    ])

    // Calculate growth percentages (simplified - you can enhance this)
    const userGrowth = totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0
    const caseGrowth = totalCourtCases > 0 ? Math.round((recentCourtCases / totalCourtCases) * 100) : 0

    return {
      success: true,
      data: {
        totalUsers,
        totalCompanies,
        totalCourtCases,
        activeUsers,
        recentCourtCases,
        companiesWithCases,
        todaysCases,
        thisWeekCases,
        thisMonthCases,
        userGrowth,
        caseGrowth,
        companyEngagement: companiesWithCases > 0 ? Math.round((companiesWithCases / totalCompanies) * 100) : 0
      }
    }
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error)
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Ошибка при получении статистики дашборда'
    })
  }
})
