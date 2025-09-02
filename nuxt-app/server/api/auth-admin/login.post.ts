import prisma from "../../../lib/prisma";
import { hash } from 'ohash'


export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { email, password } = body

    if (!email || !password) {
      return {
        status: 400,
        body: {
          success: false,
          message: 'Email and password are required'
        }
      }
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: {
        email,
        isDeleted: false
      }
    })

    if (!user) {
      return {
        status: 401,
        body: {
          success: false,
          message: 'Invalid credentials'
        }
      }
    }

    // Check if user has admin role
    if (!user.roles.includes('admin')) {
      return {
        status: 403,
        body: {
          success: false,
          message: 'Not authorized'
        }
      }
    }

    // Verify password
    const hashedPassword = hash(password)
    if (user.password !== hashedPassword) {
      return {
        status: 401,
        body: {
          success: false,
          message: 'Invalid credentials'
        }
      }
    }

    // Create session
    await setUserSession(event, {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles
      }
    })

    return {
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles
      }
    }
  } catch (error) {
    console.error('Login error:', error)
    return {
      status: 500,
      body: {
        success: false,
        message: 'An error occurred during login',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}) 