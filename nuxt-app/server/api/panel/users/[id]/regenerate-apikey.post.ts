import { prisma } from '../../../../utils/prisma'
import { randomBytes } from 'crypto'

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

    // Generate new API key
    const newApikey = randomBytes(32).toString('hex')

    // Update user with new API key
    const user = await prisma.user.update({
      where: { id },
      data: { apikey: newApikey },
      select: {
        id: true,
        email: true,
        name: true,
        roles: true,
        apikey: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return {
      success: true,
      data: user,
      message: 'API key regenerated successfully'
    }
  } catch (error: any) {
    console.error('Error regenerating API key:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
}))
