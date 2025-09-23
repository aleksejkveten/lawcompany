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
  const { courtCaseId } = body

  if (!courtCaseId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Court case ID is required'
    })
  }

  try {
    // Get court case
    const courtCase = await prisma.courtCase.findUnique({
      where: { id: parseInt(courtCaseId) },
      select: {
        id: true,
        claimant: true,
        claimantCompanyId: true,
        debtor: true,
        debtorCompanyId: true,
        triedToParse: true
      }
    })

    if (!courtCase) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Court case not found'
      })
    }

    let foundAny = false
    const sentToEGR = []
    const receivedFromEGR = []
    const results = []

    // Search for claimant company if not already assigned
    if (!courtCase.claimantCompanyId && courtCase.claimant) {
      try {
        const sentData = {
          function: 'searchCompaniesByName',
          query: courtCase.claimant
        }
        sentToEGR.push(sentData)

        const companies = await searchCompaniesByName(courtCase.claimant)
        receivedFromEGR.push({ companies })

        if (companies.length === 1) {
          try {
            const addressData = await getAddressByUnp(companies[0].ngrn.toString())
            const company = await processAndSaveCompany(companies[0], addressData, courtCase.id, false)
            foundAny = true
            results.push({
              party: 'claimant',
              found: true,
              company
            })
          } catch (addressError) {
            console.error(`Error getting address for claimant in court case ${courtCaseId}:`, addressError)
            const company = await processAndSaveCompany(companies[0], [], courtCase.id, false)
            foundAny = true
            results.push({
              party: 'claimant',
              found: true,
              company
            })
          }
        } else {
          results.push({
            party: 'claimant',
            found: false,
            company: null
          })
        }
      } catch (error) {
        console.error(`Error searching claimant for court case ${courtCaseId}:`, error)
        results.push({
          party: 'claimant',
          found: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // Search for debtor company if not already assigned
    if (!courtCase.debtorCompanyId && courtCase.debtor) {
      try {
        const sentData = {
          function: 'searchCompaniesByName',
          query: courtCase.debtor
        }
        sentToEGR.push(sentData)

        const companies = await searchCompaniesByName(courtCase.debtor)
        receivedFromEGR.push({ companies })

        if (companies.length === 1) {
          try {
            const addressData = await getAddressByUnp(companies[0].ngrn.toString())
            const company = await processAndSaveCompany(companies[0], addressData, courtCase.id, true)
            foundAny = true
            results.push({
              party: 'debtor',
              found: true,
              company
            })
          } catch (addressError) {
            console.error(`Error getting address for debtor in court case ${courtCaseId}:`, addressError)
            const company = await processAndSaveCompany(companies[0], [], courtCase.id, true)
            foundAny = true
            results.push({
              party: 'debtor',
              found: true,
              company
            })
          }
        } else {
          results.push({
            party: 'debtor',
            found: false,
            company: null
          })
        }
      } catch (error) {
        console.error(`Error searching debtor for court case ${courtCaseId}:`, error)
        results.push({
          party: 'debtor',
          found: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // Always mark as tried to parse
    await prisma.courtCase.update({
      where: { id: courtCase.id },
      data: { triedToParse: true }
    })

    if (foundAny) {
      return {
        success: true,
        message: 'Найдены компании для одной или нескольких сторон',
        results,
        sentToEGR,
        receivedFromEGR
      }
    } else {
      return {
        success: false,
        message: 'Компании не найдены',
        results,
        sentToEGR,
        receivedFromEGR
      }
    }

  } catch (error) {
    console.error('Error searching single parties:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Search failed'
    })
  }
})
