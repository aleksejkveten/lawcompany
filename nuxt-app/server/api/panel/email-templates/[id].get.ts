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

    const template = await prisma.emailTemplate.findFirst({
      where: {
        id,
        isDeleted: false
      },
      include: {
        channelCategory: true
      }
    })

    if (!template) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Template not found'
      })
    }

    return {
      success: true,
      data: template
    }
  } catch (error: any) {
    console.error('Error fetching email template:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
