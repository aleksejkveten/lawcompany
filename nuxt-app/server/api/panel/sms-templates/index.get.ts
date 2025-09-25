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
        { content: { contains: search } }
      ]
    }

    // Get data
    const templates = await prisma.smsTemplate.findMany({
      where,
      include: {
        channelCategory: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return {
      success: true,
      data: templates
    }
  } catch (error) {
    console.error('Error fetching SMS templates:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
