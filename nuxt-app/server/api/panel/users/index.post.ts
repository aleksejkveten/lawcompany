import prisma from "../../../../lib/prisma";
import bcrypt from 'bcrypt'
import { randomBytes } from 'crypto'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    // Validate required fields
    if (!body.email || !body.password) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email and password are required'
      })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        email: body.email,
        isDeleted: false
      }
    })

    if (existingUser) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User with this email already exists'
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(body.password, 10)
    
    // Generate API key
    const apikey = randomBytes(32).toString('hex')

    // Create user
    const user = await prisma.user.create({
      data: {
        email: body.email.trim(),
        name: body.name?.trim() || null,
        password: hashedPassword,
        roles: body.roles?.trim() || null,
        apikey: apikey
      },
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
    console.error('Error creating user:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
