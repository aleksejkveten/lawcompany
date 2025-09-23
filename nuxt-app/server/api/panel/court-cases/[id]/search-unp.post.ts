import { getAddressByUnp, getShortInfoByUnp, processAndSaveCompany } from "../../../../utils/egr";

export default defineEventHandler(async (event) => {
  // Check if request is from internal API (middleware check)
  const headers = getHeaders(event)
  if (!headers['x-internal-api']) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Access denied'
    })
  }

  const courtCaseId = event.context.params?.id
  if (!courtCaseId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Court case ID is required'
    })
  }

  const body = await readBody(event)
  const { unp } = body

  if (!unp || unp.length !== 9 || !/^\d{9}$/.test(unp)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'UNP must be exactly 9 digits'
    })
  }

  try {
    // Get address and short info data
    const [addressData, shortInfoData] = await Promise.all([
      getAddressByUnp(unp),
      getShortInfoByUnp(unp)
    ]);

    if (!addressData || addressData.length === 0) {
      return { success: true, data: [], foundCompany: null }
    }

    if (!shortInfoData || shortInfoData.length === 0) {
      return { success: true, data: [], foundCompany: null }
    }

    // Filter results to only include the company with matching UNP (should be exact match)
    const filteredData = shortInfoData.filter((item: any) => item.ngrn.toString() === unp)

    if (filteredData.length === 0) {
      return { success: true, data: [], foundCompany: null }
    }

    // Process and save the first (and should be only) company
    const foundCompany = await processAndSaveCompany(filteredData[0], addressData, parseInt(courtCaseId), body.isDebtor);

    return { success: true, data: filteredData, foundCompany }

  } catch (error) {
    console.error('EGR UNP search error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Search failed'
    })
  }
})
