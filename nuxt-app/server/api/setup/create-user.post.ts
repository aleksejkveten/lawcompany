import { prisma } from '../../utils/prisma'
import { hash } from 'ohash'
import { v4 as uuidv4 } from 'uuid'

export default defineEventHandler(async (event) => {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: 'dm@fkm.by',
      }
    })

    if (existingUser) {
      // Update existing user to have admin role if needed
      if (!existingUser.roles.includes('ROLE_ADMIN')) {
        const updatedUser = await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            roles: existingUser.roles.includes('admin') 
              ? `${existingUser.roles},ROLE_ADMIN` 
              : 'admin,ROLE_ADMIN',
            isDeleted: false
          }
        })

        return {
          success: true,
          message: 'User updated with ROLE_ADMIN',
          user: {
            id: updatedUser.id,
            email: updatedUser.email,
            name: updatedUser.name,
            roles: updatedUser.roles
          }
        }
      }

      return {
        success: false,
        message: 'User already exists',
        user: {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name
        }
      }
    }

    // Create new admin user
    const userPassword = '!&qrtV(RM'
    const hashedPassword = hash(userPassword)

    const adminUser = await prisma.user.create({
      data: {
        email: 'dm@fkm.by',
        name: 'Admin',
        password: hashedPassword,
        roles: 'admin,ROLE_ADMIN',
        isDeleted: false,
        updatedAt: new Date()
      }
    })

    return {
      success: true,
      message: 'Admin user created successfully',
      user: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        roles: adminUser.roles
      }
    }
  } catch (error) {
    console.error('Error creating admin user:', error)
    return {
      success: false,
      message: 'Failed to create admin user',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}) 