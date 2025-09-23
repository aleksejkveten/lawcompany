// API endpoint для обновления компании
import prisma from "../../../../lib/prisma";

export default defineEventHandler(async (event) => {
  try {
    const companyId = getRouterParam(event, 'id')
    const body = await readBody(event)
    
    if (!companyId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Company ID is required'
      })
    }
    
    if (!body.name) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Company name is required'
      })
    }
    
    // Проверяем существование компании
    const existingCompany = await prisma.company.findUnique({
      where: { id: parseInt(companyId), isDeleted: false }
    })
      
      if (!existingCompany) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Company not found'
        })
      }
      
      // Обновляем компанию и контактные лица
      const company = await prisma.$transaction(async (tx) => {
        // Обновляем компанию
        const updatedCompany = await tx.company.update({
          where: { id: parseInt(companyId) },
          data: {
            name: body.name,
            unp: body.unp || null,
            notes: body.notes || null,
            track: body.track || false,
            aliases: body.aliases || null,
            address: body.address || null,
            city: body.city || null,
            site: body.site || null,
            updatedAt: new Date()
          }
        })

        // Обработка контактных лиц
        if (body.contactPersons && Array.isArray(body.contactPersons)) {
          // Получаем существующие контакты
          const existingContacts = await tx.contactPerson.findMany({
            where: { companyId: parseInt(companyId), isDeleted: false },
            include: {
              phones: { where: { isDeleted: false } },
              emails: { where: { isDeleted: false } }
            }
          })

          const existingContactIds = existingContacts.map(c => c.id)
          const incomingContactIds = body.contactPersons.map((c: any) => c.id).filter(Boolean)

          // Удаляем контакты, которых нет в новых данных
          for (const existingId of existingContactIds) {
            if (!incomingContactIds.includes(existingId)) {
              await tx.contactPerson.update({
                where: { id: existingId },
                data: { isDeleted: true }
              })
            }
          }

          // Обрабатываем каждое контактное лицо
          for (const contactData of body.contactPersons) {
            if (!contactData.name?.trim()) continue

            let contact
            if (contactData.id) {
              // Обновляем существующий контакт
              contact = await tx.contactPerson.update({
                where: { id: contactData.id },
                data: {
                  name: contactData.name.trim(),
                  source: contactData.source || null
                }
              })

              // Обработка телефонов
              const existingPhones = await tx.phone.findMany({
                where: { contactPersonId: contactData.id, isDeleted: false }
              })
              const existingPhoneIds = existingPhones.map(p => p.id)
              const incomingPhoneIds = (contactData.phones || []).map((p: any) => p.id).filter(Boolean)

              // Удаляем старые телефоны
              for (const phoneId of existingPhoneIds) {
                if (!incomingPhoneIds.includes(phoneId)) {
                  await tx.phone.update({
                    where: { id: phoneId },
                    data: { isDeleted: true }
                  })
                }
              }

              // Обновляем/создаём телефоны
              for (const phoneData of contactData.phones || []) {
                if (!phoneData.number?.trim()) continue
                
                if (phoneData.id) {
                  await tx.phone.update({
                    where: { id: phoneData.id },
                    data: { number: phoneData.number.trim() }
                  })
                } else {
                  await tx.phone.create({
                    data: {
                      number: phoneData.number.trim(),
                      contactPersonId: contactData.id
                    }
                  })
                }
              }

              // Обработка email
              const existingEmails = await tx.email.findMany({
                where: { contactPersonId: contactData.id, isDeleted: false }
              })
              const existingEmailIds = existingEmails.map(e => e.id)
              const incomingEmailIds = (contactData.emails || []).map((e: any) => e.id).filter(Boolean)

              // Удаляем старые email
              for (const emailId of existingEmailIds) {
                if (!incomingEmailIds.includes(emailId)) {
                  await tx.email.update({
                    where: { id: emailId },
                    data: { isDeleted: true }
                  })
                }
              }

              // Обновляем/создаём email
              for (const emailData of contactData.emails || []) {
                if (!emailData.address?.trim()) continue
                
                if (emailData.id) {
                  await tx.email.update({
                    where: { id: emailData.id },
                    data: { address: emailData.address.trim() }
                  })
                } else {
                  await tx.email.create({
                    data: {
                      address: emailData.address.trim(),
                      contactPersonId: contactData.id
                    }
                  })
                }
              }
            } else {
              // Создаём новый контакт
              contact = await tx.contactPerson.create({
                data: {
                  name: contactData.name.trim(),
                  source: contactData.source || null,
                  companyId: parseInt(companyId),
                  phones: {
                    create: (contactData.phones || []).filter((p: any) => p.number?.trim()).map((p: any) => ({
                      number: p.number.trim()
                    }))
                  },
                  emails: {
                    create: (contactData.emails || []).filter((e: any) => e.address?.trim()).map((e: any) => ({
                      address: e.address.trim()
                    }))
                  }
                }
              })
            }
          }
        }

        // Возвращаем обновлённую компанию с контактами
        return await tx.company.findUnique({
          where: { id: parseInt(companyId) },
          include: {
            contactPersons: {
              where: { isDeleted: false },
              include: {
                phones: { where: { isDeleted: false } },
                emails: { where: { isDeleted: false } }
              }
            }
          }
        })
      })
      
    return {
      success: true,
      data: company,
      message: 'Company updated successfully'
    }
    
  } catch (error: any) {
    console.error('Error updating company:', error)
    
    if (error?.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update company'
    })
  }
})
