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
      select: { id: true, debtor: true, debtorCompanyId: true, triedToParse: true }
    })

    if (!courtCase) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Court case not found'
      })
    }

    if (courtCase.debtorCompanyId) {
      return {
        success: true,
        message: 'Компания уже привязана',
        foundCompany: null,
        sentToEGR: null,
        receivedFromEGR: null
      }
    }



    if (!courtCase.debtor) {
      // Still mark as tried to parse
      await prisma.courtCase.update({
        where: { id: courtCase.id },
        data: { triedToParse: true }
      })
      return {
        success: false,
        message: 'Название ответчика не указано',
        foundCompany: null,
        sentToEGR: null,
        receivedFromEGR: null
      }
    }

    // Search for companies using EGR API
    const sentToEGR = {
      function: 'searchCompaniesByName',
      query: courtCase.debtor
    }

    const companies = await searchCompaniesByName(courtCase.debtor)

    const receivedFromEGR = { companies }

    if (companies.length === 1) {
      try {
        const addressData = await getAddressByUnp(companies[0].ngrn.toString())
        const foundCompany = await processAndSaveCompany(companies[0], addressData, courtCase.id, true)
        return {
          success: true,
          message: 'Компания найдена и привязана',
          foundCompany,
          sentToEGR,
          receivedFromEGR
        }
      } catch (addressError) {
        console.error(`Error getting address for court case ${courtCase.id}:`, addressError)
        // Still process without address data
        const foundCompany = await processAndSaveCompany(companies[0], [], courtCase.id, true)
        return {
          success: true,
          message: 'Компания найдена и привязана (без адреса)',
          foundCompany,
          sentToEGR,
          receivedFromEGR
        }
      }
    } else {
      // Mark as tried to parse
      await prisma.courtCase.update({
        where: { id: courtCase.id },
        data: { triedToParse: true }
      })
      return {
        success: false,
        message: 'Компания не найдена',
        foundCompany: null,
        sentToEGR,
        receivedFromEGR
      }
    }

  } catch (error) {
    console.error('Error searching single defendant:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Search failed'
    })
  }
})
