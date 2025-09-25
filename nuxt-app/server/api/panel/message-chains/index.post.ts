import prisma from "../../../../lib/prisma";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    // Validate required fields
    if (!body.name || !body.chains || !Array.isArray(body.chains)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Name and chains array are required'
      })
    }

    // Check if chain already exists
    const existingChain = await prisma.messageChain.findFirst({
      where: {
        name: body.name,
        isDeleted: false
      }
    })

    if (existingChain) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Message chain with this name already exists'
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

    // Create message chain
    const chain = await prisma.messageChain.create({
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
    console.error('Error creating message chain:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
