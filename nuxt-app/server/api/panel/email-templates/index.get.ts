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
        { subject: { contains: search } }
      ]
    }

    // Get data
    const templates = await prisma.emailTemplate.findMany({
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
    console.error('Error fetching email templates:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
