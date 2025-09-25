import prisma from "../../../../lib/prisma";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    // Validate required fields
    if (!body.name) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Name is required'
      })
    }

    // Check if category already exists
    const existingCategory = await prisma.channelCategory.findFirst({
      where: {
        name: body.name,
        isDeleted: false
      }
    })

    if (existingCategory) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Category with this name already exists'
      })
    }

    // Create category
    const category = await prisma.channelCategory.create({
      data: {
        name: body.name.trim()
      }
    })

    return {
      success: true,
      data: category
    }
  } catch (error: any) {
    console.error('Error creating channel category:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
