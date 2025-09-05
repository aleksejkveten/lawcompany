// Enhanced sidebar functionality for Court Data Collector with real API integration and logging
console.log('Court Data Collector enhanced sidebar script loaded');

// Prevent multiple initialization
if (typeof window.CourtDataCollectorSidebar === 'undefined') {

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
        logApiCall: (method, url, status, time, details) => console.log(`[API] ${method} ${url}`, { status, time, ...details }),
        logExtensionEvent: (event, details) => console.log(`[EXTENSION] ${event}`, details)
    };
}

// Create global namespace to avoid conflicts
window.CourtDataCollectorSidebar = (function() {
    let currentTab = 'data-collection';
    let isConfigExpanded = false; // Default to collapsed
    let apiKey = '';
    let serverUrl = 'http://localhost:3000';
    
    function init() {
        console.log('Initializing enhanced sidebar functionality');
        logger.logExtensionEvent('sidebar_init_start', {
            currentTab: currentTab,
            isConfigExpanded: isConfigExpanded
        });
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                initializeSidebar();
            });
        } else {
            initializeSidebar();
        }
    }
    
    function initializeSidebar() {
        console.log('DOM ready, setting up sidebar...');
        
        // Load settings from storage
        loadSettings();
        
        // Setup event listeners
        setupEventListeners();
        
        // Initialize configuration as collapsed
        setTimeout(() => {
            const configContent = document.getElementById('config-content');
            const configHeader = document.getElementById('config-header');
            const toggleBtn = document.getElementById('config-toggle');
            
            console.log('Setting up collapsed config:', {
                configContent: !!configContent,
                configHeader: !!configHeader,
                toggleBtn: !!toggleBtn
            });
            
            if (configContent && configHeader && toggleBtn) {
                configContent.classList.add('cdc-collapsed');
                configHeader.classList.add('cdc-collapsed');
                toggleBtn.textContent = '▶';
                console.log('Configuration collapsed successfully');
            }
        }, 100);
        
        // Show default tab
        showTab('data-collection');
        
        logger.logExtensionEvent('sidebar_init_complete', {
            currentTab: currentTab
        });
        
        console.log('Sidebar initialization complete');
    }
    
    function setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Tab switching
        const tabButtons = document.querySelectorAll('.cdc-menu-btn');
        console.log('Found tab buttons:', tabButtons.length);
        
        tabButtons.forEach((button, index) => {
            const tabName = button.getAttribute('data-tab');
            console.log(`Setting up tab button ${index}: ${tabName}`);
            
            button.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('Tab button clicked:', tabName);
                switchTab(tabName);
            });
        });
        
        // Configuration toggle
        const configToggle = document.getElementById('config-toggle');
        console.log('Config toggle found:', !!configToggle);
        
        if (configToggle) {
            configToggle.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Config toggle clicked');
                toggleConfigBlock();
            });
        }
        
        // Configuration tabs
        const configTabs = document.querySelectorAll('.cdc-config-tab');
        console.log('Found config tabs:', configTabs.length);
        
        configTabs.forEach((tab, index) => {
            const configType = tab.getAttribute('data-config');
            console.log(`Setting up config tab ${index}: ${configType}`);
            
            tab.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('Config tab clicked:', configType);
                
                if (this.classList.contains('cdc-disabled')) {
                    console.log('Config tab is disabled, ignoring click');
                    return;
                }
                
                // Update tab states
                configTabs.forEach(t => t.classList.remove('cdc-active'));
                this.classList.add('cdc-active');
                
                // Show/hide config forms
                const newConfig = document.getElementById('new-config');
                const checkConfig = document.getElementById('check-config');
                
                if (newConfig) newConfig.style.display = configType === 'new' ? 'block' : 'none';
                if (checkConfig) checkConfig.style.display = configType === 'check' ? 'block' : 'none';
                
                console.log('Config forms updated:', {
                    newConfig: configType === 'new' ? 'visible' : 'hidden',
                    checkConfig: configType === 'check' ? 'visible' : 'hidden'
                });
            });
        });
        
        // Settings functionality
        setupSettingsEvents();
        
        // Data collection functionality
        setupDataCollectionEvents();
        
        // Data retrieval functionality
        setupDataRetrievalEvents();
        
        // Logs functionality
        setupLogsEvents();
        
        console.log('Event listeners setup complete');
    }
    
    function setupSettingsEvents() {
        const apiKeyInput = document.getElementById('api-key');
        const toggleApiKeyBtn = document.getElementById('toggle-api-key');
        const saveSettingsBtn = document.getElementById('save-settings');
        
        if (toggleApiKeyBtn) {
            toggleApiKeyBtn.addEventListener('click', function() {
                const input = document.getElementById('api-key');
                if (input.type === 'password') {
                    input.type = 'text';
                    this.textContent = '🙈';
                } else {
                    input.type = 'password';
                    this.textContent = '👁';
                }
            });
        }
        
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', saveSettings);
        }
    }
    
    function setupDataCollectionEvents() {
        const collectDataBtn = document.getElementById('collect-data');
        const startAutoBtn = document.getElementById('start-auto');
        const stopAutoBtn = document.getElementById('stop-auto');
        
        if (collectDataBtn) {
            collectDataBtn.addEventListener('click', collectData);
        }
        
        if (startAutoBtn) {
            startAutoBtn.addEventListener('click', function() {
                showStatus('Автоматический сбор будет реализован в следующих версиях', 'error');
            });
        }
        
        if (stopAutoBtn) {
            stopAutoBtn.addEventListener('click', function() {
                showStatus('Автоматический сбор будет реализован в следующих версиях', 'error');
            });
        }
    }
    
    function setupDataRetrievalEvents() {
        const retrieveDataBtn = document.getElementById('retrieve-data');
        
        if (retrieveDataBtn) {
            retrieveDataBtn.addEventListener('click', retrieveData);
        }
    }
    
    function setupLogsEvents() {
        const refreshLogsBtn = document.getElementById('refresh-logs');
        const clearLogsBtn = document.getElementById('clear-logs');
        const exportLogsBtn = document.getElementById('export-logs');
        const logLevelFilter = document.getElementById('log-level-filter');
        const logCategoryFilter = document.getElementById('log-category-filter');
        const logSearch = document.getElementById('log-search');
        
        if (refreshLogsBtn) {
            refreshLogsBtn.addEventListener('click', refreshLogs);
        }
        
        if (clearLogsBtn) {
            clearLogsBtn.addEventListener('click', clearLogs);
        }
        
        if (exportLogsBtn) {
            exportLogsBtn.addEventListener('click', exportLogs);
        }
        
        if (logLevelFilter) {
            logLevelFilter.addEventListener('change', filterLogs);
        }
        
        if (logCategoryFilter) {
            logCategoryFilter.addEventListener('change', filterLogs);
        }
        
        if (logSearch) {
            logSearch.addEventListener('input', debounce(filterLogs, 300));
        }
        
        // Load logs when logs tab is first viewed
        refreshLogs();
    }
    
    function switchTab(tabName) {
        console.log(`Switching tab from ${currentTab} to ${tabName}`);
        
        logger.logUserAction('tab_switch', {
            from: currentTab,
            to: tabName
        });
        
        // Update button states
        const tabButtons = document.querySelectorAll('.cdc-menu-btn');
        console.log('Updating tab buttons, found:', tabButtons.length);
        
        tabButtons.forEach(button => {
            const buttonTab = button.getAttribute('data-tab');
            button.classList.remove('cdc-active');
            if (buttonTab === tabName) {
                button.classList.add('cdc-active');
                console.log(`Activated tab button: ${buttonTab}`);
            }
        });
        
        // Show/hide tab content
        showTab(tabName);
        currentTab = tabName;
        
        console.log(`Tab switch complete: ${currentTab}`);
    }
    
    function showTab(tabName) {
        console.log(`Showing tab: ${tabName}`);
        
        const tabContents = document.querySelectorAll('.cdc-tab-content');
        console.log('Found tab contents:', tabContents.length);
        
        tabContents.forEach(content => {
            content.classList.remove('cdc-active');
            console.log(`Hiding tab: ${content.id}`);
        });
        
        const targetTab = document.getElementById(tabName);
        console.log('Target tab found:', !!targetTab, tabName);
        
        if (targetTab) {
            targetTab.classList.add('cdc-active');
            console.log(`Tab activated: ${tabName}`);
        } else {
            console.error(`Tab not found: ${tabName}`);
        }
    }
    
    function toggleConfigBlock() {
        const configContent = document.getElementById('config-content');
        const toggleBtn = document.getElementById('config-toggle');
        const configHeader = document.getElementById('config-header');
        
        if (configContent && toggleBtn && configHeader) {
            isConfigExpanded = !isConfigExpanded;
            
            logger.logUserAction('config_toggle', {
                expanded: isConfigExpanded
            });
            
            if (isConfigExpanded) {
                configContent.classList.remove('cdc-collapsed');
                configHeader.classList.remove('cdc-collapsed');
                toggleBtn.textContent = '▼';
            } else {
                configContent.classList.add('cdc-collapsed');
                configHeader.classList.add('cdc-collapsed');
                toggleBtn.textContent = '▶';
            }
        }
    }
    
    function loadSettings() {
        // Load settings from Chrome storage
        if (typeof chrome !== 'undefined' && chrome.runtime) {
            chrome.runtime.sendMessage(
                { action: 'getSettings' },
                function(response) {
                    if (response && response.success) {
                        apiKey = response.settings.apiKey || '';
                        serverUrl = response.settings.serverUrl || 'http://localhost:3000';
                        
                        // Update UI
                        const apiKeyInput = document.getElementById('api-key');
                        if (apiKeyInput) {
                            apiKeyInput.value = apiKey;
                        }
                    }
                }
            );
        }
    }
    
    function saveSettings() {
        const apiKeyInput = document.getElementById('api-key');
        
        if (apiKeyInput) {
            const newApiKey = apiKeyInput.value.trim();
            
            if (!newApiKey) {
                logger.logUserAction('settings_save_failed', {
                    reason: 'empty_api_key'
                });
                showStatus('API ключ не может быть пустым', 'error');
                return;
            }
            
            const settings = {
                apiKey: newApiKey,
                serverUrl: serverUrl
            };
            
            logger.logUserAction('settings_save_attempt', {
                hasApiKey: !!newApiKey,
                serverUrl: serverUrl
            });
            
            // Save to Chrome storage
            if (typeof chrome !== 'undefined' && chrome.runtime) {
                chrome.runtime.sendMessage(
                    { 
                        action: 'saveSettings',
                        settings: settings
                    },
                    function(response) {
                        if (response && response.success) {
                            apiKey = newApiKey;
                            logger.logUserAction('settings_save_success', {
                                method: 'chrome_storage'
                            });
                            showStatus('Настройки сохранены', 'success');
                        } else {
                            logger.logUserAction('settings_save_failed', {
                                method: 'chrome_storage',
                                error: response ? response.error : 'unknown'
                            });
                            showStatus('Ошибка при сохранении настроек', 'error');
                        }
                    }
                );
            }
        }
    }
    
    function collectData() {
        if (!apiKey) {
            logger.logUserAction('data_collection_failed', {
                reason: 'no_api_key'
            });
            showStatus('Сначала настройте API ключ в разделе настроек', 'error');
            switchTab('settings');
            return;
        }
        
        logger.logDataCollection('collect_start', 'initiated', {
            hasApiKey: !!apiKey,
            serverUrl: serverUrl
        });
        
        showLoading(true);
        showStatus('Сбор данных...', 'info');
        
        // Collect data from the current page using content script
        if (typeof chrome !== 'undefined' && chrome.runtime) {
            chrome.runtime.sendMessage(
                { action: 'collectData' },
                function(response) {
                    if (response && response.success) {
                        logger.logDataCollection('page_data_collected', 'success', {
                            dataCount: response.data ? response.data.length : 0
                        });
                        // Send data to server
                        sendDataToServer(response.data);
                    } else {
                        showLoading(false);
                        logger.logDataCollection('page_data_collection_failed', 'error', {
                            error: response ? response.error : 'unknown'
                        });
                        showStatus('Ошибка при сборе данных', 'error');
                    }
                }
            );
        } else {
            // Fallback for direct content script communication
            collectPageData();
        }
    }
    
    function collectPageData() {
        try {
            const data = collectCourtData();
            if (data && data.length > 0) {
                sendDataToServer(data);
            } else {
                showLoading(false);
                showStatus('На странице не найдено данных для сбора', 'warning');
            }
        } catch (error) {
            showLoading(false);
            showStatus('Ошибка при сборе данных: ' + error.message, 'error');
        }
    }
    
    function collectCourtData() {
        // This function will be called from content script context
        const cases = [];
        const rows = document.querySelectorAll('table tbody tr');
        
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 7) {
                const cellTexts = Array.from(cells).map(cell => 
                    cell.textContent.trim().replace(/\s+/g, ' ')
                );
                
                if (cellTexts[0] && cellTexts[0] !== '' && !isNaN(cellTexts[0])) {
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
                        courtName: extractCourtName(),
                        pageUrl: window.location.href,
                        collectedAt: new Date().toISOString()
                    };
                    
                    cases.push(caseData);
                }
            }
        });
        
        return cases;
    }
    
    function parseCourtDate(dateStr) {
        if (!dateStr) return null;
        
        const dateRegex = /(\d{2})\.(\d{2})\.(\d{4})/;
        const match = dateStr.match(dateRegex);
        
        if (match) {
            const day = match[1];
            const month = match[2];
            const year = match[3];
            return `${year}-${month}-${day}`;
        }
        
        return null;
    }
    
    function parseDebtAmount(amountStr) {
        if (!amountStr) return null;
        
        const numericValue = amountStr.replace(/[^\d.,]/g, '').replace(',', '.');
        const parsed = parseFloat(numericValue);
        
        return isNaN(parsed) ? null : parsed;
    }
    
    function extractCourtName() {
        const titleElement = document.querySelector('title, h1, .court-name');
        if (titleElement) {
            return titleElement.textContent.trim();
        }
        
        const urlPattern = /\/\/([^\/]+)/;
        const match = window.location.href.match(urlPattern);
        return match ? match[1] : 'Unknown Court';
    }
    
    function sendDataToServer(data) {
        if (!Array.isArray(data) || data.length === 0) {
            showLoading(false);
            logger.logDataCollection('send_to_server_failed', 'no_data', {
                dataType: typeof data,
                dataLength: Array.isArray(data) ? data.length : 'not_array'
            });
            showStatus('Нет данных для отправки', 'warning');
            return;
        }
        
        const startTime = Date.now();
        logger.logDataCollection('send_to_server_start', 'initiated', {
            casesCount: data.length,
            serverUrl: serverUrl
        });
        
        // Send to real API endpoint
        fetch(`${serverUrl}/api/remote/process-data`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey
            },
            body: JSON.stringify({ cases: data })
        })
        .then(response => {
            const responseTime = Date.now() - startTime;
            logger.logApiCall('POST', '/api/remote/process-data', response.status, responseTime, {
                casesCount: data.length
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(result => {
            showLoading(false);
            
            if (result.success) {
                const stats = result.stats;
                logger.logDataCollection('send_to_server_success', 'completed', {
                    created: stats.created,
                    updated: stats.updated,
                    skipped: stats.skipped,
                    responseTime: Date.now() - startTime
                });
                showStatus(
                    `Данные отправлены! Новых: ${stats.created}, обновлено: ${stats.updated}, пропущено: ${stats.skipped}`, 
                    'success'
                );
            } else {
                throw new Error('API returned error response');
            }
        })
        .catch(error => {
            showLoading(false);
            const responseTime = Date.now() - startTime;
            
            logger.logDataCollection('send_to_server_failed', 'error', {
                error: error.message,
                responseTime: responseTime,
                casesCount: data.length
            });
            
            console.error('Error sending data:', error);
            
            let errorMessage = 'Ошибка при отправке данных';
            if (error.message.includes('401')) {
                errorMessage = 'Неверный API ключ';
            } else if (error.message.includes('500')) {
                errorMessage = 'Ошибка сервера';
            } else if (error.message.includes('Failed to fetch')) {
                errorMessage = 'Не удается подключиться к серверу';
            }
            
            showStatus(errorMessage, 'error');
        });
    }
    
    function retrieveData() {
        if (!apiKey) {
            logger.logUserAction('data_retrieval_failed', {
                reason: 'no_api_key'
            });
            showStatus('Сначала настройте API ключ в разделе настроек', 'error');
            switchTab('settings');
            return;
        }
        
        logger.logDataCollection('retrieve_start', 'initiated', {
            hasApiKey: !!apiKey,
            serverUrl: serverUrl
        });
        
        showLoading(true);
        showStatus('Загрузка данных...', 'info');
        
        const startTime = Date.now();
        
        // Make API call to retrieve today's data
        fetch(`${serverUrl}/api/remote/today-data?apiKey=${encodeURIComponent(apiKey)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey
            }
        })
        .then(response => {
            const responseTime = Date.now() - startTime;
            logger.logApiCall('GET', '/api/remote/today-data', response.status, responseTime);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            showLoading(false);
            
            if (data.success) {
                logger.logDataCollection('retrieve_success', 'completed', {
                    totalCreated: data.data.summary.totalCreated,
                    totalUpdated: data.data.summary.totalUpdated,
                    responseTime: Date.now() - startTime
                });
                displayRetrievedData(data.data);
                showStatus(`Данные загружены! Новых: ${data.data.summary.totalCreated}, обновлено: ${data.data.summary.totalUpdated}`, 'success');
            } else {
                throw new Error('API returned error response');
            }
        })
        .catch(error => {
            showLoading(false);
            const responseTime = Date.now() - startTime;
            
            logger.logDataCollection('retrieve_failed', 'error', {
                error: error.message,
                responseTime: responseTime
            });
            
            console.error('Error retrieving data:', error);
            
            let errorMessage = 'Ошибка при загрузке данных';
            if (error.message.includes('401')) {
                errorMessage = 'Неверный API ключ';
            } else if (error.message.includes('500')) {
                errorMessage = 'Ошибка сервера';
            } else if (error.message.includes('Failed to fetch')) {
                errorMessage = 'Не удается подключиться к серверу';
            }
            
            showStatus(errorMessage, 'error');
        });
    }
    
    function displayRetrievedData(data) {
        const resultsContainer = document.getElementById('data-results');
        
        if (!resultsContainer) return;
        
        resultsContainer.innerHTML = '';
        
        const totalItems = data.createdToday.count + data.updatedToday.count;
        
        if (totalItems === 0) {
            resultsContainer.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 20px;">Данных за сегодня не найдено</p>';
            return;
        }
        
        // Create summary section
        const summaryDiv = document.createElement('div');
        summaryDiv.className = 'data-summary';
        summaryDiv.innerHTML = `
            <h4 style="margin: 0 0 10px 0; color: #1f2937;">Сводка за ${formatDate(data.summary.date)}</h4>
            <div style="display: flex; gap: 15px; margin-bottom: 15px;">
                <span style="background: #10b981; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                    Новых: ${data.summary.totalCreated}
                </span>
                <span style="background: #f59e0b; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                    Обновлено: ${data.summary.totalUpdated}
                </span>
            </div>
        `;
        resultsContainer.appendChild(summaryDiv);
        
        // Display created today cases
        if (data.createdToday.count > 0) {
            const createdSection = document.createElement('div');
            createdSection.innerHTML = '<h5 style="margin: 15px 0 10px 0; color: #059669;">Новые дела</h5>';
            resultsContainer.appendChild(createdSection);
            
            data.createdToday.cases.forEach(item => {
                const itemDiv = createCaseElement(item, 'created');
                resultsContainer.appendChild(itemDiv);
            });
        }
        
        // Display updated today cases
        if (data.updatedToday.count > 0) {
            const updatedSection = document.createElement('div');
            updatedSection.innerHTML = '<h5 style="margin: 15px 0 10px 0; color: #d97706;">Обновленные дела</h5>';
            resultsContainer.appendChild(updatedSection);
            
            data.updatedToday.cases.forEach(item => {
                const itemDiv = createCaseElement(item, 'updated');
                resultsContainer.appendChild(itemDiv);
            });
        }
    }
    
    function createCaseElement(caseData, type) {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'cdc-data-item';
        itemDiv.style.borderLeft = `3px solid ${type === 'created' ? '#10b981' : '#f59e0b'}`;
        
        const caseNumber = caseData.caseNumber || caseData.registrationNumber || 'Не указан';
        const claimant = caseData.claimant || 'Не указан';
        const debtor = caseData.debtor || 'Не указан';
        const amount = formatAmount(caseData.debtAmount);
        const receiptDate = formatDate(caseData.receiptDate);
        const court = caseData.courtName || 'Не указан';
        const timestamp = type === 'created' ? 
            formatDateTime(caseData.createdAt) : 
            formatDateTime(caseData.updatedAt);
        
        itemDiv.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                <h4 style="margin: 0; font-size: 14px; color: #1f2937;">${caseNumber}</h4>
                <span style="font-size: 11px; color: #6b7280;">${timestamp}</span>
            </div>
            <p style="margin: 4px 0; font-size: 12px;"><strong>Взыскатель:</strong> ${claimant}</p>
            <p style="margin: 4px 0; font-size: 12px;"><strong>Должник:</strong> ${debtor}</p>
            <p style="margin: 4px 0; font-size: 12px;"><strong>Сумма:</strong> ${amount}</p>
            <p style="margin: 4px 0; font-size: 12px;"><strong>Дата поступления:</strong> ${receiptDate}</p>
            <p style="margin: 4px 0; font-size: 12px;"><strong>Суд:</strong> ${court}</p>
        `;
        
        return itemDiv;
    }
    
    function formatAmount(amount) {
        if (!amount) return 'Не указана';
        
        // If it's already a formatted string, return as is
        if (typeof amount === 'string' && amount.includes('BYN')) {
            return amount;
        }
        
        // If it's a number, format it
        if (typeof amount === 'number') {
            return `${amount.toLocaleString('ru')} BYN`;
        }
        
        return amount.toString();
    }
    
    function formatDate(dateString) {
        if (!dateString) return 'Не указана';
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('ru-RU');
        } catch {
            return dateString;
        }
    }
    
    function formatDateTime(dateString) {
        if (!dateString) return 'Не указано';
        
        try {
            const date = new Date(dateString);
            return date.toLocaleString('ru-RU', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateString;
        }
    }
    
    function showLoading(show) {
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = show ? 'flex' : 'none';
        }
    }
    
    function showStatus(message, type = '') {
        const statusElement = document.getElementById('status-message');
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.className = 'cdc-status-message';
            
            if (type) {
                statusElement.classList.add('cdc-' + type);
            }
            
            if (message) {
                setTimeout(() => {
                    statusElement.textContent = '';
                    statusElement.className = 'cdc-status-message';
                }, type === 'success' ? 3000 : 5000);
            }
        }
    }
    
    // Logs functionality
    async function refreshLogs() {
        try {
            if (logger && logger.getLogs) {
                const logs = await logger.getLogs({ limit: 100 });
                const stats = await logger.getStats();
                
                displayLogStats(stats);
                displayLogs(logs);
                
                logger.logUserAction('logs_refreshed', {
                    totalLogs: stats.total
                });
            } else {
                displayLogs([]);
                displayLogStats({ total: 0, byLevel: {}, byCategory: {} });
            }
        } catch (error) {
            console.error('Error refreshing logs:', error);
            showStatus('Ошибка при загрузке логов', 'error');
        }
    }
    
    async function filterLogs() {
        try {
            if (!logger || !logger.getLogs) return;
            
            const levelFilter = document.getElementById('log-level-filter')?.value;
            const categoryFilter = document.getElementById('log-category-filter')?.value;
            const searchText = document.getElementById('log-search')?.value;
            
            const options = {
                limit: 100
            };
            
            if (levelFilter) options.level = levelFilter;
            if (categoryFilter) options.category = categoryFilter;
            if (searchText) options.search = searchText;
            
            const logs = await logger.getLogs(options);
            displayLogs(logs);
            
            logger.logUserAction('logs_filtered', {
                level: levelFilter,
                category: categoryFilter,
                hasSearch: !!searchText,
                resultCount: logs.length
            });
        } catch (error) {
            console.error('Error filtering logs:', error);
            showStatus('Ошибка при фильтрации логов', 'error');
        }
    }
    
    async function clearLogs() {
        if (!confirm('Вы уверены, что хотите удалить все логи?')) {
            return;
        }
        
        try {
            if (logger && logger.clearLogs) {
                await logger.clearLogs();
                await refreshLogs();
                showStatus('Логи очищены', 'success');
                
                logger.logUserAction('logs_cleared', {});
            }
        } catch (error) {
            console.error('Error clearing logs:', error);
            showStatus('Ошибка при очистке логов', 'error');
        }
    }
    
    async function exportLogs() {
        try {
            if (!logger || !logger.exportLogs) {
                showStatus('Экспорт логов недоступен', 'error');
                return;
            }
            
            const format = 'json'; // Could be made configurable
            const logsData = await logger.exportLogs(format);
            
            // Create download link
            const blob = new Blob([logsData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `court-data-collector-logs-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            showStatus('Логи экспортированы', 'success');
            
            logger.logUserAction('logs_exported', {
                format: format
            });
        } catch (error) {
            console.error('Error exporting logs:', error);
            showStatus('Ошибка при экспорте логов', 'error');
        }
    }
    
    function displayLogStats(stats) {
        const statsContainer = document.getElementById('log-stats');
        if (!statsContainer) return;
        
        statsContainer.innerHTML = `
            <div class="cdc-stats-grid">
                <div class="cdc-stat-item">
                    <span class="cdc-stat-label">Всего:</span>
                    <span class="cdc-stat-value">${stats.total || 0}</span>
                </div>
                <div class="cdc-stat-item cdc-error">
                    <span class="cdc-stat-label">Ошибки:</span>
                    <span class="cdc-stat-value">${stats.byLevel?.ERROR || 0}</span>
                </div>
                <div class="cdc-stat-item cdc-warn">
                    <span class="cdc-stat-label">Предупреждения:</span>
                    <span class="cdc-stat-value">${stats.byLevel?.WARN || 0}</span>
                </div>
                <div class="cdc-stat-item cdc-info">
                    <span class="cdc-stat-label">Информация:</span>
                    <span class="cdc-stat-value">${stats.byLevel?.INFO || 0}</span>
                </div>
            </div>
        `;
    }
    
    function displayLogs(logs) {
        const logsContainer = document.getElementById('log-entries');
        if (!logsContainer) return;
        
        if (logs.length === 0) {
            logsContainer.innerHTML = '<p class="cdc-no-logs">Логи не найдены</p>';
            return;
        }
        
        logsContainer.innerHTML = logs.map(log => {
            const timestamp = new Date(log.timestamp).toLocaleString('ru-RU');
            const levelClass = 'cdc-' + log.level.toLowerCase();
            const contextStr = Object.keys(log.context || {}).length > 0 ? 
                JSON.stringify(log.context, null, 2) : '';
            
            return `
                <div class="cdc-log-entry ${levelClass}">
                    <div class="cdc-log-header">
                        <span class="cdc-log-level">${log.level}</span>
                        <span class="cdc-log-category">[${log.category}]</span>
                        <span class="cdc-log-timestamp">${timestamp}</span>
                    </div>
                    <div class="cdc-log-message">${log.message}</div>
                    ${contextStr ? `<div class="cdc-log-context"><pre>${contextStr}</pre></div>` : ''}
                </div>
            `;
        }).join('');
    }
    
    // Utility function for debouncing
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Public API
    return {
        init: init,
        switchTab: switchTab,
        collectData: collectData,
        retrieveData: retrieveData,
        collectCourtData: collectCourtData,
        refreshLogs: refreshLogs,
        clearLogs: clearLogs,
        exportLogs: exportLogs,
        // Debug functions
        debug: {
            checkElements: function() {
                console.log('=== DEBUG: Checking sidebar elements ===');
                console.log('Tab buttons:', document.querySelectorAll('.cdc-menu-btn').length);
                console.log('Tab contents:', document.querySelectorAll('.cdc-tab-content').length);
                console.log('Config toggle:', !!document.getElementById('config-toggle'));
                console.log('Config tabs:', document.querySelectorAll('.cdc-config-tab').length);
                
                const tabs = ['data-collection', 'data-retrieval', 'logs', 'settings'];
                tabs.forEach(tab => {
                    const element = document.getElementById(tab);
                    console.log(`Tab ${tab}:`, !!element, element ? element.classList.contains('cdc-active') : 'N/A');
                });
            },
            testTabSwitch: function(tabName) {
                console.log(`=== DEBUG: Testing tab switch to ${tabName} ===`);
                switchTab(tabName);
            },
            getCurrentTab: function() { return currentTab; },
            isConfigExpanded: function() { return isConfigExpanded; }
        }
    };
})();

} // End of CourtDataCollectorSidebar check