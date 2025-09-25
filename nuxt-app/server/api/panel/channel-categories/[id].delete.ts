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

    // Check if category is used by templates
    const emailTemplatesCount = await prisma.emailTemplate.count({
      where: {
        channelCategoryId: id,
        isDeleted: false
      }
    })

    const smsTemplatesCount = await prisma.smsTemplate.count({
      where: {
        channelCategoryId: id,
        isDeleted: false
      }
    })

    if (emailTemplatesCount > 0 || smsTemplatesCount > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Cannot delete category that is used by templates'
      })
    }

    // Soft delete category
    await prisma.channelCategory.update({
      where: { id },
      data: { isDeleted: true }
    })

    return {
      success: true,
      message: 'Category deleted successfully'
    }
  } catch (error: any) {
    console.error('Error deleting channel category:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
