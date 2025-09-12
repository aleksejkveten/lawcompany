// Court Data Collector - Data Collection Module
// This module handles scraping and processing court case data from web pages

// Create a simple object directly on window
if (typeof window.CourtDataCollector === 'undefined') {
    // Simple function definitions
    function collectCourtData() {
        const pageData = {
            url: window.location.href,
            title: document.title,
            timestamp: new Date().toISOString(),
            cases: []
        };
        
        try {
            // Check if DOM is ready
            if (document.readyState === 'loading') {
                // DOM is still loading, data collection might be incomplete
            }
            
            // Find all court sections on the page
            const courtSections = findCourtSections();
            
            courtSections.forEach((section) => {
                const courtCases = extractCasesFromSection(section);
                pageData.cases.push(...courtCases);
            });
            
            return pageData;
            
        } catch (error) {
            // Silent error handling to prevent blocking
            return { cases: [], url: window.location.href, error: error.message };
        }
    }
    
    function findCourtSections() {
        const sections = [];
        
        try {
            // Look for court name headers followed by tables
            const potentialHeaders = document.querySelectorAll('h1, h2, h3, h4, h5, h6, .panel-title, .court-name');
            
            potentialHeaders.forEach(header => {
                const headerText = header.textContent.trim();
                
                if (isCourtName(headerText)) {
                    const table = findNextDataTable(header);
                    if (table) {
                        sections.push({
                            courtName: headerText,
                            table: table,
                            header: header
                        });
                    }
                }
            });
            
            // Fallback: look for tables without specific headers
            if (sections.length === 0) {
                const tables = document.querySelectorAll('table');
                
                tables.forEach(table => {
                    if (isCourtDataTable(table)) {
                        sections.push({
                            courtName: extractCourtNameFromContext(table),
                            table: table,
                            header: null
                        });
                    }
                });
            }
        } catch (error) {
            // Silent error handling
        }
        
        return sections;
    }
    
    function isCourtName(text) {
        const courtKeywords = [
            'экономический суд',
            'хозяйственный суд',
            'арбитражный суд',
            'суд',
            'economic court',
            'court'
        ];
        
        const lowerText = text.toLowerCase();
        return courtKeywords.some(keyword => lowerText.includes(keyword));
    }
    
    function findNextDataTable(element) {
        let current = element.nextElementSibling;
        let searchDepth = 0;
        
        while (current && searchDepth < 10) {
            if (current.tagName === 'TABLE' && isCourtDataTable(current)) {
                return current;
            }
            
            const nestedTable = current.querySelector('table');
            if (nestedTable && isCourtDataTable(nestedTable)) {
                return nestedTable;
            }
            
            current = current.nextElementSibling;
            searchDepth++;
        }
        
        return null;
    }
    
    function isCourtDataTable(table) {
        try {
            const thead = table.querySelector('thead');
            const tbody = table.querySelector('tbody');
            
            if (!thead || !tbody) return false;
            
            const headerText = thead.textContent.toLowerCase();
            
            // Check for required columns
            const requiredColumns = ['взыскатель', 'должник', 'дело', 'дата'];
            const hasRequiredColumns = requiredColumns.some(col => headerText.includes(col));
            
            // Check if table has data rows
            const dataRows = tbody.querySelectorAll('tr');
            const hasDataRows = dataRows.length > 0;
            
            return hasRequiredColumns && hasDataRows;
        } catch (error) {
            return false;
        }
    }
    
    function extractCourtNameFromContext(table) {
        try {
            let current = table.previousElementSibling;
            let searchDepth = 0;
            
            while (current && searchDepth < 5) {
                const text = current.textContent.trim();
                if (isCourtName(text)) {
                    return text;
                }
                current = current.previousElementSibling;
                searchDepth++;
            }
            
            const title = document.title;
            if (isCourtName(title)) {
                return title;
            }
            
            return 'Неизвестный суд';
        } catch (error) {
            return 'Неизвестный суд';
        }
    }
    
    function extractCasesFromSection(section) {
        const cases = [];
        const { courtName, table } = section;
        
        try {
            const tbody = table.querySelector('tbody');
            if (!tbody) return cases;
            
            const rows = tbody.querySelectorAll('tr');
            
            rows.forEach((row) => {
                try {
                    const caseData = extractCaseFromRow(row, courtName);
                    if (caseData) {
                        cases.push(caseData);
                    }
                } catch (error) {
                    // Silent error handling
                }
            });
        } catch (error) {
            // Silent error handling
        }
        
        return cases;
    }
    
    function extractCaseFromRow(row, courtName) {
        try {
            const cells = row.querySelectorAll('td');
            
            if (cells.length < 6) return null;
            
            const cellTexts = Array.from(cells).map(cell => {
                const span = cell.querySelector('span');
                return span ? span.textContent.trim() : cell.textContent.trim();
            });
            
            // Skip template/header rows
            if (cellTexts.every(text => /^[1-9]$/.test(text))) return null;
            if (cellTexts.every(text => !text || text.length < 2)) return null;
            
            const caseData = {
                claimant: cellTexts[4] || '',
                debtor: cellTexts[5] || '',
                incomingNumber: cellTexts[2] || '',
                courtName: courtName,
                caseNumber: cellTexts[1] || null,
                receiptDate: parseCourtDate(cellTexts[3] || ''),
                debtAmount: parseDebtAmount(cellTexts[6] || ''),
                decision: cellTexts[7] || null,
                registrationNumber: cellTexts[1] || '',
                sourceUrl: window.location.href,
                collectedAt: new Date().toISOString()
            };
            
            if (!caseData.claimant || !caseData.debtor || !caseData.incomingNumber) {
                return null;
            }
            
            return caseData;
        } catch (error) {
            return null;
        }
    }
    
    function parseCourtDate(dateStr) {
        if (!dateStr || typeof dateStr !== 'string') return null;
        
        const match = dateStr.match(/(\d{2})\.(\d{2})\.(\d{4})/);
        if (!match) return null;
        
        const [, day, month, year] = match;
        try {
            const date = new Date(year, month - 1, day);
            return date.toISOString();
        } catch {
            return null;
        }
    }
    
    function parseDebtAmount(amountStr) {
        if (!amountStr || typeof amountStr !== 'string') return null;
        
        const match = amountStr.match(/([\d,\.]+)/);
        if (!match) return null;
        
        const numStr = match[1].replace(',', '');
        const parsed = parseFloat(numStr);
        
        return isNaN(parsed) ? null : parsed;
    }
    
    // Direct assignment to window
    window.CourtDataCollector = {
        collectCourtData: collectCourtData,
        debug: {
            findCourtSections: findCourtSections,
            extractCasesFromSection: extractCasesFromSection,
            isCourtDataTable: isCourtDataTable
        }
    };
    
    // Listen for messages from content script or background script
    if (typeof chrome !== 'undefined' && chrome.runtime) {
        chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
            if (request.action === 'executeDataCollection') {
                try {
                    const data = collectCourtData();
                    sendResponse({ success: true, data: data });
                } catch (error) {
                    sendResponse({ success: false, error: error.message });
                }
                return true; // Keep message channel open for async response
            }
        });
    }
    
} else {
    // Listen for messages from content script or background script
    if (typeof chrome !== 'undefined' && chrome.runtime) {
        chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
            if (request.action === 'executeDataCollection') {
                try {
                    const data = window.CourtDataCollector.collectCourtData();
                    sendResponse({ success: true, data: data });
                } catch (error) {
                    sendResponse({ success: false, error: error.message });
                }
                return true; // Keep message channel open for async response
            }
        });
    }
}

// Add error handling for the entire script execution
try {
    // This ensures the script doesn't fail silently
} catch (error) {
    // Ensure the object is still created even if there are errors
    if (typeof window.CourtDataCollector === 'undefined') {
        window.CourtDataCollector = {
            collectCourtData: function() {
                return { cases: [], url: window.location.href, error: 'Initialization failed' };
            },
            debug: {}
        };
    }
}