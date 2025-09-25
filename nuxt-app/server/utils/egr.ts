import prisma from "../../lib/prisma";

// For development: ignore SSL certificate errors
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

// Types for EGR API responses
interface EGRCompanyShortInfo {
  vfn: string;
  ngrn: number;
  dfrom: string;
  nsi00201?: {
    nkstran: number;
    nsi00201: number;
    vnstranp: string;
  };
  nsi00219: {
    vnsostk: string;
    nsi00219: number;
    nksost: number;
  };
  vnaim: string;
  vn: string;
}

interface EGRAddressInfo {
  cact: string;
  dfrom: string;
  dto: string;
  ngrn: number;
  nindex: number;
  nsi00201: {
    nkstran: number;
    nsi00201: number;
    vnstranp: string;
  };
  nsi00202: {
    nksoato: number;
    nsi00202: number;
    objectnumber: number;
    vnsfull: string;
  };
  nsi00226: {
    nktul: number;
    nsi00226: number;
    vntulk: string;
  };
  nsi00227: {
    nktpom: number;
    nsi00227: number;
    vntpomk: string;
  };
  nsi00234: {
    nkvpom: number;
    nsi00234: number;
    vnvpom: string;
  };
  nsi00239: {
    nktnp: number;
    nsi00239: number;
    vntnpk: string;
  };
  vadrprim: string;
  vdistrict: string;
  vdom: string;
  vemail: string;
  vfax: string;
  vkorp: string;
  vnp: string;
  vpom: string;
  vregion: string;
  vsite: string;
  vtels: string;
  vulitsa: string;
}

// Function to extract company name from quotes
function extractCompanyNameFromQuotes(fullName: string): string {
  // Try to extract name from quotes (e.g., "ВЕЛЕВ БЕЛ" from «ВЕЛЕВ БЕЛ»)
  const quoteMatch = fullName.match(/[«"]([^«"]+)[»"]/);
  if (quoteMatch) {
    return quoteMatch[1].trim();
  }

  // If no quotes found, return the whole text
  return fullName.trim();
}

// Function to search companies by name
export async function searchCompaniesByName(query: string): Promise<EGRCompanyShortInfo[]> {
  if (!query || query.length < 4) {
    throw new Error('Query must be at least 4 characters');
  }

  if (/^\d+$/.test(query)) {
    throw new Error('Use UNP search for numeric queries');
  }

  // Extract the actual company name from quotes or legal form
  const searchQuery = extractCompanyNameFromQuotes(query);

  if (!searchQuery || searchQuery.length < 2) {
    throw new Error('Could not extract valid company name from query');
  }

  try {
    const response = await fetch(`https://egr.gov.by/api/v2/egr/getShortInfoByRegName/${encodeURIComponent(searchQuery)}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      // If not found (404), return empty array instead of throwing
      if (response.status === 404) {
        return [];
      }
      throw new Error(`EGR API error: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      // If response is not JSON, it might be an HTML error page
      const text = await response.text();
      if (text.includes('<html') || text.includes('<!DOCTYPE')) {
        // HTML response, treat as no results
        return [];
      }
      throw new Error('EGR API returned non-JSON response');
    }

    const text = await response.text();
    if (!text.trim()) {
      // Return empty array if response is empty
      return [];
    }

    try {
      const data = JSON.parse(text);
      // Ensure we return an array
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Failed to parse EGR API response:', error, 'Response text:', text.substring(0, 200));
      throw new Error('Invalid JSON response from EGR API');
    }
  } catch (error) {
    // If it's a network error or other fetch error, return empty array
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.warn('Network error when calling EGR API:', error);
      return [];
    }
    throw error;
  }
}

// Function to get address info by UNP
export async function getAddressByUnp(unp: string): Promise<EGRAddressInfo[]> {
  if (!unp || unp.length !== 9 || !/^\d{9}$/.test(unp)) {
    throw new Error('UNP must be exactly 9 digits');
  }

  const response = await fetch(`https://egr.gov.by/api/v2/egr/getAddressByRegNum/${unp}`);

  if (!response.ok) {
    throw new Error('EGR API error - company not found');
  }

  return response.json();
}



// Function to get short info by UNP
export async function getShortInfoByUnp(unp: string): Promise<EGRCompanyShortInfo[]> {
  if (!unp || unp.length !== 9 || !/^\d{9}$/.test(unp)) {
    throw new Error('UNP must be exactly 9 digits');
  }

  try {
    const response = await fetch(`https://egr.gov.by/api/v2/egr/getShortInfoByRegNum/${unp}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      // If not found (404), return empty array instead of throwing
      if (response.status === 404) {
        return [];
      }
      throw new Error(`EGR API error: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      // If response is not JSON, it might be an HTML error page
      const text = await response.text();
      if (text.includes('<html') || text.includes('<!DOCTYPE')) {
        // HTML response, treat as no results
        return [];
      }
      throw new Error('EGR API returned non-JSON response');
    }

    const text = await response.text();
    if (!text.trim()) {
      // Return empty array if response is empty
      return [];
    }

    try {
      const data = JSON.parse(text);
      // Ensure we return an array
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Failed to parse EGR API response:', error, 'Response text:', text.substring(0, 200));
      throw new Error('Invalid JSON response from EGR API');
    }
  } catch (error) {
    // If it's a network error or other fetch error, return empty array
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.warn('Network error when calling EGR API:', error);
      return [];
    }
    throw error;
  }
}

// Function to process and save company data
export async function processAndSaveCompany(
  companyData: EGRCompanyShortInfo,
  addressData?: EGRAddressInfo[],
  courtCaseId?: number,
  isDebtor?: boolean
) {
  // Save to CompanyBase
  const companyBase = await prisma.companyBase.upsert({
    where: { unp: companyData.ngrn.toString() },
    update: {
      fullName: companyData.vnaim,
      shortName: companyData.vn,
      status: companyData.nsi00219.vnsostk,
      country: companyData.nsi00201?.vnstranp
    },
    create: {
      fullName: companyData.vnaim,
      shortName: companyData.vn,
      status: companyData.nsi00219.vnsostk,
      country: companyData.nsi00201?.vnstranp,
      unp: companyData.ngrn.toString()
    }
  });

  // Save to Company
  const company = await prisma.company.upsert({
    where: { unp: companyData.ngrn.toString() },
    update: {
      name: companyData.vn,
      aliases: companyData.vnaim
    },
    create: {
      name: companyData.vn,
      unp: companyData.ngrn.toString(),
      aliases: companyData.vnaim
    }
  });

  // Process address data if available
  if (addressData && addressData.length > 0) {
    const addr = addressData[0];
    const addressString = `${addr.nindex || ''}, ${addr.vnp || ''}, ${addr.vulitsa || ''}, ${addr.vdom || ''}${addr.vkorp ? `-${addr.vkorp}` : ''}${addr.vpom ? `, ${addr.vpom}` : ''}`.replace(/^, |, $/, '');

    // Update CompanyBase
    await prisma.companyBase.update({
      where: { id: companyBase.id },
      data: {
        address: addressString,
        email: addr.vemail,
        site: addr.vsite,
        phones: addr.vtels
      }
    });

    // Update Company
    await prisma.company.update({
      where: { id: company.id },
      data: {
        address: addressString,
        city: addr.vnp,
        site: addr.vsite
      }
    });

    // Handle phones
    if (addr.vtels) {
      const phones = addr.vtels.split(',').map((p: string) => p.trim().replace(/[^\d]/g, '')).filter((p: string) => p.length >= 9);

      // Mark existing as deleted
      await prisma.contactPerson.updateMany({
        where: { companyId: company.id, name: 'Общий', isDeleted: false },
        data: { isDeleted: true }
      });

      // Create new ContactPerson
      const contactPerson = await prisma.contactPerson.create({
        data: {
          name: 'Общий',
          companyId: company.id,
          source: 'ЕГР'
        }
      });

      // Add phones
      for (const phone of phones) {
        await prisma.phone.create({
          data: {
            number: phone,
            contactPersonId: contactPerson.id
          }
        });
      }

      // Add email if exists
      if (addr.vemail) {
        await prisma.email.create({
          data: {
            address: addr.vemail,
            contactPersonId: contactPerson.id
          }
        });
      }
    }
  }

  // Update CourtCase if provided
  if (courtCaseId) {
    const updateData = isDebtor ? { debtorCompanyId: company.id } : { claimantCompanyId: company.id };
    await prisma.courtCase.update({
      where: { id: courtCaseId },
      data: updateData
    });

    // Add debtor name to aliases if new debtorId
    if (isDebtor) {
      const courtCase = await prisma.courtCase.findUnique({
        where: { id: courtCaseId }
      });
      if (courtCase && courtCase.debtor) {
        await prisma.company.update({
          where: { id: company.id },
          data: {
            aliases: `${company.aliases || ''},${courtCase.debtor}`.replace(/^,/, '')
          }
        });
      }
    }
  }

  // Set triedToParse to true
  if (courtCaseId) {
    await prisma.courtCase.update({
      where: { id: courtCaseId },
      data: { triedToParse: true }
    });
  }

  return company;
}
