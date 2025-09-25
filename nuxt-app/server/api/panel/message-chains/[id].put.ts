import prisma from "../../../../lib/prisma";

export default defineEventHandler(async (event) => {
  try {
    const id = parseInt(getRouterParam(event, 'id') as string)
    const body = await readBody(event)

    if (!id || isNaN(id)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid chain ID'
      })
    }

    // Check if chain exists
    const existingChain = await prisma.messageChain.findFirst({
      where: {
        id,
        isDeleted: false
      }
    })

    if (!existingChain) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Message chain not found'
      })
    }

    // Validate required fields
    if (!body.name || !body.chains || !Array.isArray(body.chains)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Name and chains array are required'
      })
    }

    // Validate chains structure
    for (const chain of body.chains) {
      if (!chain.templateId || !chain.type || typeof chain.daysOffset !== 'number') {
        throw createError({
          statusCode: 400,
          statusMessage: 'Each chain must have templateId, type, and daysOffset'
        })
      }
      if (!['email', 'sms'].includes(chain.type)) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Chain type must be email or sms'
        })
      }
    }

    // Check if name is already taken by another chain
    const duplicateChain = await prisma.messageChain.findFirst({
      where: {
        name: body.name,
        isDeleted: false,
        NOT: { id }
      }
    })

    if (duplicateChain) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Name is already taken by another chain'
      })
    }

    // Update message chain
    const chain = await prisma.messageChain.update({
      where: { id },
      data: {
        name: body.name.trim(),
        description: body.description?.trim() || null,
        chains: body.chains
      },
      include: {
        emailTemplates: true,
        smsTemplates: true
      }
    })

    return {
      success: true,
      data: chain
    }
  } catch (error: any) {
    console.error('Error updating message chain:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
