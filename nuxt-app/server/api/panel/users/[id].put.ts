import { prisma } from '../../../utils/prisma'
import bcrypt from 'bcrypt'

export default defineEventHandler(async (event) => {
  try {
    const id = parseInt(getRouterParam(event, 'id') as string)
    const body = await readBody(event)
    
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

    // Validate required fields
    if (!body.email) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email is required'
      })
    }

    // Check if email is already taken by another user
    const duplicateUser = await prisma.user.findFirst({
      where: {
        email: body.email,
        isDeleted: false,
        NOT: { id }
      }
    })

    if (duplicateUser) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email is already taken by another user'
      })
    }

    // Prepare update data
    const updateData: any = {
      email: body.email.trim(),
      name: body.name?.trim() || null,
      roles: body.roles?.trim() || null
    }

    // Hash new password if provided
    if (body.password) {
      updateData.password = await bcrypt.hash(body.password, 10)
    }

    // Update user
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
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
      data: user
    }
  } catch (error: any) {
    console.error('Error updating user:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
