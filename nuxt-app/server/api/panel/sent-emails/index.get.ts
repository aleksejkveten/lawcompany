import prisma from "../../../../lib/prisma";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const page = Math.max(1, parseInt(query.page as string) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(query.limit as string) || 20))
    const search = query.search as string || ''
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      isDeleted: false
    }

    if (search) {
      where.OR = [
        { content: { contains: search } },
        { subject: { contains: search } },
        { email: { contains: search } }
      ]
    }

    // Get total count and data
    const [total, messages] = await Promise.all([
      prisma.sentEmail.count({ where }),
      prisma.sentEmail.findMany({
        where,
        include: {
          company: true,
          template: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      })
    ])

    return {
      success: true,
      data: messages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  } catch (error) {
    console.error('Error fetching sent emails:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
