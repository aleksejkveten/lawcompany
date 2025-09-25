import prisma from "../../../../lib/prisma";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    // Validate required fields
    if (!body.name || !body.subject || !body.content || !body.channelCategoryId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Name, subject, content and channel category are required'
      })
    }

    // Check if template already exists
    const existingTemplate = await prisma.emailTemplate.findFirst({
      where: {
        name: body.name,
        isDeleted: false
      }
    })

    if (existingTemplate) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Template with this name already exists'
      })
    }

    // Create template
    const template = await prisma.emailTemplate.create({
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
    console.error('Error creating email template:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
