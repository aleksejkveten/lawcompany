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
    const existingTemplate = await prisma.emailTemplate.findFirst({
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
    if (!body.name || !body.subject || !body.content || !body.channelCategoryId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Name, subject, content and channel category are required'
      })
    }

    // Check if name is already taken by another template
    const duplicateTemplate = await prisma.emailTemplate.findFirst({
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
    const template = await prisma.emailTemplate.update({
      where: { id },
      data: {
        name: body.name.trim(),
        subject: body.subject.trim(),
        content: body.content.trim(),
        format: body.format || 'plaintext',
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
    console.error('Error updating email template:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
