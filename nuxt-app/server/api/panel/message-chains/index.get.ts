import prisma from "../../../../lib/prisma";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const search = query.search as string || ''

    // Build where clause
    const where: any = {
      isDeleted: false
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } }
      ]
    }

    // Get data
    const chains = await prisma.messageChain.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        emailTemplates: true,
        smsTemplates: true
      }
    })

    return {
      success: true,
      data: chains
    }
  } catch (error) {
    console.error('Error fetching message chains:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
