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

    // Soft delete chain
    await prisma.messageChain.update({
      where: { id },
      data: { isDeleted: true }
    })

    return {
      success: true,
      message: 'Message chain deleted successfully'
    }
  } catch (error: any) {
    console.error('Error deleting message chain:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
