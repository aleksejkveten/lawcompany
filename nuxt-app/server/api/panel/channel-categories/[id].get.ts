import prisma from "../../../../lib/prisma";

export default defineEventHandler(async (event) => {
  try {
    const id = parseInt(getRouterParam(event, 'id') as string)

    if (!id || isNaN(id)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid category ID'
      })
    }

    const category = await prisma.channelCategory.findFirst({
      where: {
        id,
        isDeleted: false
      }
    })

    if (!category) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Category not found'
      })
    }

    return {
      success: true,
      data: category
    }
  } catch (error: any) {
    console.error('Error fetching channel category:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
