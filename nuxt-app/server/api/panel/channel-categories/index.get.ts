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
    const categories = await prisma.channelCategory.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    return {
      success: true,
      data: categories
    }
  } catch (error) {
    console.error('Error fetching channel categories:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
