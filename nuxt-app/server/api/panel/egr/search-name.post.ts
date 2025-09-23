import { searchCompaniesByName, processAndSaveCompany } from "../../../utils/egr";

export default defineEventHandler(async (event) => {
  // Check if request is from internal API (middleware check)
  const headers = getHeaders(event)
  const isInternalCall = headers['x-internal-api'] === 'true'

  // For internal calls, skip authentication
  if (!isInternalCall) {
    // Check user authentication for external calls
    const user = event.context.user
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'User session not found'
      })
    }
  }

  const body = await readBody(event)
  const { query, courtCaseId, isDebtor } = body

  if (!query || query.length < 4) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Query must be at least 4 characters'
    })
  }

  // Validate that query is not purely numeric (for name search)
  if (/^\d+$/.test(query)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Use UNP search endpoint for numeric queries'
    })
  }

  try {
    // Call EGR API for name search
    const data = await searchCompaniesByName(query)

    let foundCompany = null

    // Process and save data
    for (const item of data) {
      // Get address data for this company
      let addressData: any[] = [];
      try {
        // @ts-ignore
        addressData = await $fetch(`https://egr.gov.by/api/v2/egr/getAddressByRegNum/${item.ngrn}`);
      } catch (error) {
        console.error('Address fetch error:', error);
      }

      // Process and save company data
      const company = await processAndSaveCompany(
        item,
        addressData,
        data.length === 1 ? courtCaseId : undefined, // Only link to court case if single result
        data.length === 1 ? isDebtor : undefined
      );

      // If only one result, set foundCompany
      if (data.length === 1) {
        foundCompany = company;
      }
    }

    // Set triedToParse to true if courtCaseId provided
    if (courtCaseId) {
      await prisma.courtCase.update({
        where: { id: parseInt(courtCaseId) },
        data: { triedToParse: true }
      });
    }

    return { success: true, data, foundCompany }

  } catch (error) {
    console.error('EGR name search error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Search failed'
    })
  }
})
