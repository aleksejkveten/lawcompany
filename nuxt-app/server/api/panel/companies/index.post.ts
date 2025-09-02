// API endpoint для создания новой компании
import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    // Валидация обязательных полей
    if (!body.name) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Company name is required'
      })
    }
    
    // Создаем компанию с контактными лицами
      const company = await prisma.company.create({
        data: {
          name: body.name,
          unp: body.unp || null,
          contactPersons: {
            create: (body.contactPersons || []).map((cp: any) => ({
              name: cp.name,
              phones: {
                create: (cp.phones || []).map((phone: any) => ({
                  number: phone.number
                }))
              },
              emails: {
                create: (cp.emails || []).map((email: any) => ({
                  address: email.address
                }))
              }
            }))
          }
        },
        include: {
          contactPersons: {
            include: {
              phones: true,
              emails: true
            }
          }
        }
      })
      
    return {
      success: true,
      data: company,
      message: 'Company created successfully'
    }
    
  } catch (error: any) {
    console.error('Error creating company:', error)
    
    if (error?.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create company'
    })
  }
})