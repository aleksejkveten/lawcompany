import prisma from "../../../../lib/prisma";

export default defineEventHandler(async (event) => {
  try {
    const id = parseInt(getRouterParam(event, 'id') as string)
    const body = await readBody(event)

    if (!id || isNaN(id)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid category ID'
      })
    }

    // Check if category exists
    const existingCategory = await prisma.channelCategory.findFirst({
      where: {
        id,
        isDeleted: false
      }
    })

    if (!existingCategory) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Category not found'
      })
    }

    // Validate required fields
    if (!body.name) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Name is required'
      })
    }

    // Check if name is already taken by another category
    const duplicateCategory = await prisma.channelCategory.findFirst({
      where: {
        name: body.name,
        isDeleted: false,
        NOT: { id }
      }
    })

    if (duplicateCategory) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Name is already taken by another category'
      })
    }

    // Update category
    const category = await prisma.channelCategory.update({
      where: { id },
      data: {
        name: body.name.trim()
      }
    })

    return {
      success: true,
      data: category
    }
  } catch (error: any) {
    console.error('Error updating channel category:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
