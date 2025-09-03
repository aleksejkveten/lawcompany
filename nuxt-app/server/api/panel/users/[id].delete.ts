import prisma from "../../../../lib/prisma";

export default defineEventHandler(async (event) => {
  try {
    const id = parseInt(getRouterParam(event, 'id') as string)
    
    if (!id || isNaN(id)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid user ID'
      })
    }

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        id,
        isDeleted: false
      }
    })

    if (!existingUser) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }

    // Soft delete user
    await prisma.user.update({
      where: { id },
      data: { isDeleted: true }
    })

    return {
      success: true,
      message: 'User deleted successfully'
    }
  } catch (error: any) {
    console.error('Error deleting user:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
