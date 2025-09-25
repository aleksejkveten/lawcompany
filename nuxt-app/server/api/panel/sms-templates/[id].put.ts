import prisma from "../../../../lib/prisma";

export default defineEventHandler(async (event) => {
  try {
    const id = parseInt(getRouterParam(event, 'id') as string)
    const body = await readBody(event)

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

    // Validate required fields
    if (!body.name || !body.content || !body.channelCategoryId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Name, content and channel category are required'
      })
    }

    // Check if name is already taken by another template
    const duplicateTemplate = await prisma.smsTemplate.findFirst({
      where: {
        name: body.name,
        isDeleted: false,
        NOT: { id }
      }
    })

    if (duplicateTemplate) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Name is already taken by another template'
      })
    }

    // Update template
    const template = await prisma.smsTemplate.update({
      where: { id },
      data: {
        name: body.name.trim(),
        content: body.content.trim(),
        channelCategoryId: parseInt(body.channelCategoryId)
      },
      include: {
        channelCategory: true
      }
    })

    return {
      success: true,
      data: template
    }
  } catch (error: any) {
    console.error('Error updating SMS template:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
