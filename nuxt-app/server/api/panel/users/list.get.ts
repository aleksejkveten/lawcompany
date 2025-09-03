import prisma from "../../../../lib/prisma";

export default defineEventHandler(async (event) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        isDeleted: false
      },
      select: {
        id: true,
        email: true,
        name: true
      },
      orderBy: { name: 'asc' }
    })

    return {
      success: true,
      data: users
    }
  } catch (error) {
    console.error('Error fetching users list:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
