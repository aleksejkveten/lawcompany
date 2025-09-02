// Content script for Chrome extension - Right sidebar injection with logging
console.log('Court Data Collector content script loaded');

// Initialize logger
let logger = null;
if (typeof window !== 'undefined' && window.ExtensionLogger) {
    logger = window.ExtensionLogger;
} else {
    // Fallback console logger
    logger = {
        info: (msg, ctx, cat) => console.log(`[INFO] ${msg}`, ctx),
        error: (msg, ctx, cat) => console.error(`[ERROR] ${msg}`, ctx),
        warn: (msg, ctx, cat) => console.warn(`[WARN] ${msg}`, ctx),
        debug: (msg, ctx, cat) => console.debug(`[DEBUG] ${msg}`, ctx),
        logUserAction: (action, details) => console.log(`[USER_ACTION] ${action}`, details),
        logDataCollection: (op, result, details) => console.log(`[DATA_COLLECTION] ${op}`, { result, ...details }),
        logExtensionEvent: (event, details) => console.log(`[EXTENSION] ${event}`, details),
        logPageNavigation: (from, to, details) => console.log(`[NAVIGATION] ${from} -> ${to}`, details)
    };
}

let sidebarInjected = false;
let sidebarContainer = null;
let sidebarVisible = false;

// Initialize extension when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeExtension);
} else {
    initializeExtension();
}

function initializeExtension() {
    console.log('Court Data Collector: Initializing extension');
    logger.logExtensionEvent('content_script_init', {
        url: window.location.href,
        readyState: document.readyState
    });
    
    // Listen for extension icon click
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        console.log('Message received in content script:', request);
        logger.logExtensionEvent('message_received', {
            action: request.action,
            from: 'background'
        });
        
        if (request.action === 'toggleSidebar') {
            toggleSidebar();
            sendResponse({ success: true, visible: sidebarVisible });
        } else if (request.action === 'collectData') {
            const pageData = collectPageData();
            sendResponse({ success: true, data: pageData });
        }
    });
    
    // Inject sidebar on first load (hidden)
    injectSidebar();
}

function injectSidebar() {
    if (sidebarInjected) return;
    
    // Create sidebar container
    sidebarContainer = document.createElement('div');
    sidebarContainer.id = 'court-data-collector-sidebar';
    sidebarContainer.className = 'cdc-sidebar-container';
    
    // Load sidebar HTML
    const sidebarURL = chrome.runtime.getURL('sidebar.html');
    
    fetch(sidebarURL)
        .then(response => response.text())
        .then(html => {
            sidebarContainer.innerHTML = html;
            
            // Adjust body layout to accommodate sidebar
            adjustPageLayout();
            
            // Append sidebar to body
            document.body.appendChild(sidebarContainer);
            
            // Initialize sidebar functionality
            initializeSidebarEvents();
            
            sidebarInjected = true;
            console.log('Court Data Collector: Sidebar injected successfully');
        })
        .catch(error => {
            console.error('Court Data Collector: Failed to load sidebar HTML:', error);
        });
}

function adjustPageLayout() {
    // Prevent page content from being hidden behind sidebar
    const style = document.createElement('style');
    style.id = 'cdc-page-adjustment';
    style.textContent = `
        .cdc-sidebar-container {
            position: fixed !important;
            top: 0 !important;
            right: -400px !important;
            width: 400px !important;
            height: 100vh !important;
            z-index: 2147483647 !important;
            transition: right 0.3s ease !important;
            background: white !important;
            box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1) !important;
        }
        
        .cdc-sidebar-container.visible {
            right: 0 !important;
        }
        
        body.cdc-sidebar-open {
            margin-right: 400px !important;
            transition: margin-right 0.3s ease !important;
        }
        
        /* Override any conflicting styles */
        .cdc-sidebar-container * {
            box-sizing: border-box !important;
        }
    `;
    document.head.appendChild(style);
}

function toggleSidebar() {
    if (!sidebarContainer) {
        console.warn('Court Data Collector: Sidebar not injected yet');
        return;
    }
    
    sidebarVisible = !sidebarVisible;
    
    if (sidebarVisible) {
        sidebarContainer.classList.add('visible');
        document.body.classList.add('cdc-sidebar-open');
        console.log('Court Data Collector: Sidebar opened');
    } else {
        sidebarContainer.classList.remove('visible');
        document.body.classList.remove('cdc-sidebar-open');
        console.log('Court Data Collector: Sidebar closed');
    }
}

function initializeSidebarEvents() {
    const closeSidebarBtn = sidebarContainer.querySelector('#closeSidebar');
    if (closeSidebarBtn) {
        closeSidebarBtn.addEventListener('click', toggleSidebar);
    }
    
    // Load logger first, then sidebar script
    const loggerScript = document.createElement('script');
    loggerScript.src = chrome.runtime.getURL('assets/scripts/logger.js');
    loggerScript.onload = function() {
        console.log('Court Data Collector: Logger script loaded');
        
        // Now load and execute sidebar JavaScript
        const sidebarScript = document.createElement('script');
        sidebarScript.src = chrome.runtime.getURL('assets/scripts/sidebar.js');
        sidebarScript.onload = function() {
            console.log('Court Data Collector: Sidebar script loaded');
            // Initialize sidebar functionality
            if (window.CourtDataCollectorSidebar) {
                window.CourtDataCollectorSidebar.init();
            }
        };
        document.head.appendChild(sidebarScript);
    };
    document.head.appendChild(loggerScript);
}

function collectPageData() {
    logger.logDataCollection('page_data_collection_start', 'initiated', {
        url: window.location.href,
        title: document.title
    });
    
    // Collect data from the current page
    const pageData = {
        url: window.location.href,
        title: document.title,
        timestamp: new Date().toISOString(),
        courtName: '',
        courtData: []
    };
    
    // Try to detect court name from page structure
    const courtNameElement = document.querySelector('.panel-title a, h4.panel-title a');
    if (courtNameElement) {
        pageData.courtName = courtNameElement.textContent.trim();
    }
    
    // Look for court case data tables
    const tables = document.querySelectorAll('table.table');
    logger.logDataCollection('tables_found', 'info', {
        tablesCount: tables.length
    });
    
    tables.forEach(table => {
        const thead = table.querySelector('thead');
        const tbody = table.querySelector('tbody');
        
        if (!thead || !tbody) return;
        
        // Check if this looks like a court data table
        const headerText = thead.textContent;
        if (!headerText.includes('Взыскатель') || !headerText.includes('Должник')) return;
        
        logger.logDataCollection('court_table_found', 'info', {
            headerText: headerText.substring(0, 100)
        });
        
        // Parse table rows
        const dataRows = tbody.querySelectorAll('tr');
        let validRowsCount = 0;
        
        dataRows.forEach((row, index) => {
            const cells = row.querySelectorAll('td');
            
            // Skip header-like rows or rows with insufficient data
            if (cells.length < 9) return;
            
            const cellTexts = Array.from(cells).map(cell => {
                const span = cell.querySelector('span');
                return span ? span.textContent.trim() : cell.textContent.trim();
            });
            
            // Skip template rows (with numbers 1-9)
            if (cellTexts.every(text => /^[1-9]$/.test(text))) return;
            
            // Skip empty rows
            if (cellTexts.every(text => !text || text.length < 2)) return;
            
            const caseData = {
                serialNumber: cellTexts[0] || '',
                caseNumber: cellTexts[1] || '',
                incomingNumber: cellTexts[2] || '',
                receiptDate: parseCourtDate(cellTexts[3] || ''),
                claimant: cellTexts[4] || '',
                debtor: cellTexts[5] || '',
                debtAmount: parseDebtAmount(cellTexts[6] || ''),
                decision: cellTexts[7] || '',
                result: cellTexts[8] || '',
                courtName: pageData.courtName,
                sourceUrl: pageData.url,
                parsedAt: pageData.timestamp
            };
            
            // Only add if we have essential data
            if (caseData.incomingNumber && caseData.receiptDate && 
                caseData.claimant && caseData.debtor) {
                pageData.courtData.push(caseData);
                validRowsCount++;
            }
        });
        
        logger.logDataCollection('table_parsing_complete', 'info', {
            totalRows: dataRows.length,
            validRows: validRowsCount
        });
    });
    
    logger.logDataCollection('page_data_collection_complete', 'success', {
        totalCases: pageData.courtData.length,
        courtName: pageData.courtName,
        url: pageData.url
    });
    
    console.log('Collected court data:', pageData);
    return pageData;
}

// Helper function to parse dates in DD.MM.YYYY format
function parseCourtDate(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return null;
    
    const match = dateStr.match(/(\d{2})\.(\d{2})\.(\d{4})/);
    if (!match) return null;
    
    const [, day, month, year] = match;
    return new Date(year, month - 1, day).toISOString();
}

// Helper function to parse debt amounts
function parseDebtAmount(amountStr) {
    if (!amountStr || typeof amountStr !== 'string') return 0;
    
    // Extract numeric value from strings like "2968.63 (BYN)"
    const match = amountStr.match(/([\d,\.]+)/);
    if (!match) return 0;
    
    const numStr = match[1].replace(',', '');
    return parseFloat(numStr) || 0;
}

// Handle keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // Ctrl+Shift+C to toggle sidebar
    if (event.ctrlKey && event.shiftKey && event.code === 'KeyC') {
        event.preventDefault();
        toggleSidebar();
    }
});

// Clean up when page unloads
window.addEventListener('beforeunload', function() {
    if (sidebarContainer && sidebarContainer.parentNode) {
        sidebarContainer.parentNode.removeChild(sidebarContainer);
    }
    
    const style = document.getElementById('cdc-page-adjustment');
    if (style && style.parentNode) {
        style.parentNode.removeChild(style);
    }
    
    document.body.classList.remove('cdc-sidebar-open');
});