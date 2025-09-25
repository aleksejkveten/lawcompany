import prisma from "../../../../lib/prisma";

export default defineEventHandler(async (event) => {
  try {
    const id = parseInt(getRouterParam(event, 'id') as string)

    if (!id || isNaN(id)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid chain ID'
      })
    }

    const chain = await prisma.messageChain.findFirst({
      where: {
        id,
        isDeleted: false
      },
      include: {
        emailTemplates: true,
        smsTemplates: true
      }
    })

    if (!chain) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Message chain not found'
      })
    }

    return {
      success: true,
      data: chain
    }
  } catch (error: any) {
    console.error('Error fetching message chain:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
