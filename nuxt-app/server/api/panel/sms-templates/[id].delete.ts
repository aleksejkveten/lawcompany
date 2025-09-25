import prisma from "../../../../lib/prisma";

export default defineEventHandler(async (event) => {
  try {
    const id = parseInt(getRouterParam(event, 'id') as string)

    if (!id || isNaN(id)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid template ID'
      })
    }

    // Check if template exists
    const existingTemplate = await prisma.smsTemplate.findFirst({
      where: {
        id,
        isDeleted: false
      }
    })

    if (!existingTemplate) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Template not found'
      })
    }

    // Soft delete template
    await prisma.smsTemplate.update({
      where: { id },
      data: { isDeleted: true }
    })

    return {
      success: true,
      message: 'Template deleted successfully'
    }
  } catch (error: any) {
    console.error('Error deleting SMS template:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
