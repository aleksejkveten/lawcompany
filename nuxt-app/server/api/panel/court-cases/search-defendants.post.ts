import prisma from "../../../../lib/prisma";
import { searchCompaniesByName, processAndSaveCompany, getAddressByUnp } from "../../../utils/egr";

export default defineEventHandler(async (event) => {
  // Check if request is from internal API (middleware check)
  const headers = getHeaders(event)
  if (!headers['x-internal-api']) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Access denied'
    })
  }

  const body = await readBody(event)
  const { courtCaseIds } = body

  if (!courtCaseIds || !Array.isArray(courtCaseIds)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Court case IDs are required'
    })
  }

  try {
    // Start background search for defendants
    // This simulates a background job that would run asynchronously
    setImmediate(async () => {
      let consecutiveErrors = 0
      const maxConsecutiveErrors = 2

      for (const courtCaseId of courtCaseIds) {
        if (consecutiveErrors >= maxConsecutiveErrors) {
          console.error('Too many consecutive errors, stopping search')
          break
        }

        try {
          // Get court case
          const courtCase = await prisma.courtCase.findUnique({
            where: { id: courtCaseId },
            select: { id: true, debtor: true, debtorCompanyId: true, triedToParse: true }
          })

          if (!courtCase || courtCase.debtorCompanyId || !courtCase.debtor || courtCase.triedToParse) {
            // Skip if no court case, already has company, no debtor name, or already tried to parse
            continue
          }

          // Search for companies using EGR API
          const companies = await searchCompaniesByName(courtCase.debtor)

          if (companies.length === 1) {
            // If exactly one result, get address data and process
            try {
              const addressData = await getAddressByUnp(companies[0].ngrn.toString())
              await processAndSaveCompany(companies[0], addressData, courtCase.id, true)
              consecutiveErrors = 0 // Reset error counter on success
            } catch (addressError) {
              console.error(`Error getting address for court case ${courtCaseId}:`, addressError)
              // Still process without address data
              await processAndSaveCompany(companies[0], [], courtCase.id, true)
              consecutiveErrors = 0
            }
          } else {
            // Mark as tried to parse even if not found or multiple
            await prisma.courtCase.update({
              where: { id: courtCase.id },
              data: { triedToParse: true }
            })
            consecutiveErrors++
          }

        } catch (error) {
          console.error(`Error searching for court case ${courtCaseId}:`, error)
          consecutiveErrors++
        }

        // Wait 1 second between requests
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      console.log('Defendant search completed')
    })

    return {
      success: true,
      message: 'Поиск ответчиков запущен. Результаты будут доступны через 5 минут.'
    }
  } catch (error) {
    console.error('Error starting defendant search:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to start search'
    })
  }
})
