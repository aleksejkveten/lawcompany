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
    // Start background search for parties (both claimant and debtor)
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
            select: {
              id: true,
              claimant: true,
              claimantCompanyId: true,
              debtor: true,
              debtorCompanyId: true,
              triedToParse: true
            }
          })

          if (!courtCase || courtCase.triedToParse) {
            continue
          }

          let foundAny = false

          // Search for claimant company if not already assigned
          if (!courtCase.claimantCompanyId && courtCase.claimant) {
            try {
              const companies = await searchCompaniesByName(courtCase.claimant)
              if (companies.length === 1) {
                try {
                  const addressData = await getAddressByUnp(companies[0].ngrn.toString())
                  await processAndSaveCompany(companies[0], addressData, courtCase.id, false)
                  foundAny = true
                } catch (addressError) {
                  console.error(`Error getting address for claimant in court case ${courtCaseId}:`, addressError)
                  // Still process without address data
                  await processAndSaveCompany(companies[0], [], courtCase.id, false)
                  foundAny = true
                }
              }
            } catch (error) {
              console.error(`Error searching claimant for court case ${courtCaseId}:`, error)
            }
          }

          // Search for debtor company if not already assigned
          if (!courtCase.debtorCompanyId && courtCase.debtor) {
            try {
              const companies = await searchCompaniesByName(courtCase.debtor)
              if (companies.length === 1) {
                try {
                  const addressData = await getAddressByUnp(companies[0].ngrn.toString())
                  await processAndSaveCompany(companies[0], addressData, courtCase.id, true)
                  foundAny = true
                } catch (addressError) {
                  console.error(`Error getting address for debtor in court case ${courtCaseId}:`, addressError)
                  // Still process without address data
                  await processAndSaveCompany(companies[0], [], courtCase.id, true)
                  foundAny = true
                }
              }
            } catch (error) {
              console.error(`Error searching debtor for court case ${courtCaseId}:`, error)
            }
          }

          // Always mark as tried to parse
          await prisma.courtCase.update({
            where: { id: courtCase.id },
            data: { triedToParse: true }
          })

          if (foundAny) {
            consecutiveErrors = 0 // Reset error counter on success
          } else {
            consecutiveErrors++
          }

        } catch (error) {
          console.error(`Error searching for court case ${courtCaseId}:`, error)
          consecutiveErrors++
        }

        // Wait 1 second between requests
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      console.log('Parties search completed')
    })

    // Return different message for individual vs bulk search
    const isIndividualSearch = courtCaseIds.length === 1
    const message = isIndividualSearch
      ? 'Поиск завершен'
      : 'Поиск сторон запущен. Результаты будут доступны через 5 минут.'

    return {
      success: true,
      message
    }
  } catch (error) {
    console.error('Error starting parties search:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to start search'
    })
  }
})
