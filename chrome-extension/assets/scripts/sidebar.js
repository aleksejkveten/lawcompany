
// Enhanced sidebar functionality for Court Data Collector with improved reliability
// Simplified and more robust implementation

// Prevent duplicate script execution
if (window.sidebarScriptLoaded || window.CourtDataCollectorSidebar) {
    // Script already loaded
} else {
    window.sidebarScriptLoaded = true;

    // Main sidebar object
    const CourtDataCollectorSidebar = {
        // State variables
        currentTab: 'data-collection',
        isConfigExpanded: false,
        apiKey: '',
        serverUrl: 'http://localhost:3000',
        isInitialized: false,
        
        // Send message to content script (which has access to Chrome API)
        sendMessageToContentScript(action, data, callback, retryCount = 0) {
            // Create unique message ID
            const messageId = 'sidebar_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

            let timeoutId;
            let responded = false;

            // Listen for response
            const responseHandler = (event) => {
                if (event.source !== window) return;
                if (event.data.type === 'SIDEBAR_RESPONSE' && event.data.messageId === messageId) {
                    if (responded) return; // Prevent duplicate responses
                    responded = true;

                    window.removeEventListener('message', responseHandler);
                    if (timeoutId) clearTimeout(timeoutId);

                    callback(event.data.response);
                }
            };

            window.addEventListener('message', responseHandler);

            // Send message to content script
            window.postMessage({
                type: 'SIDEBAR_REQUEST',
                messageId: messageId,
                action: action,
                data: data
            }, '*');

            // Timeout after 15 seconds with retry logic
            timeoutId = setTimeout(() => {
                if (responded) return; // Already responded
                responded = true;

                window.removeEventListener('message', responseHandler);

                // Retry up to 2 times
                if (retryCount < 2) {
                    setTimeout(() => {
                        this.sendMessageToContentScript(action, data, callback, retryCount + 1);
                    }, 1000); // Wait 1 second before retry
                } else {
                    console.error(`Message ${messageId} failed after 2 retries`);
                    callback({ success: false, error: 'Request timeout after retries' });
                }
            }, 15000);
        },
        
        // Initialize the sidebar
        init() {
            
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.initializeSidebar());
            } else {
                this.initializeSidebar();
            }
        },
        
        // Main initialization function
        initializeSidebar() {
            
            // Check if sidebar container exists
            const sidebarContainer = document.getElementById('court-data-collector-sidebar');
            if (!sidebarContainer) {
                console.log('Sidebar container not found, retrying...');
                setTimeout(() => this.initializeSidebar(), 500);
                return;
            }
            
            // Load settings
            this.loadSettings();
            
            // Setup all event listeners
            this.setupEventListeners();
            
            // Initialize configuration as collapsed
            this.initializeConfigBlock();
            
            // Show default tab immediately (without background loading)
            this.showTabImmediate('data-collection');
            
            // Mark as initialized
            this.isInitialized = true;
        },
        
        // Show specific tab immediately (for initial load)
        showTabImmediate(tabName) {
            const tabContents = document.querySelectorAll('.cdc-tab-content');
            tabContents.forEach(content => {
                content.classList.remove('cdc-active');
            });
            
            const targetTab = document.getElementById(tabName);
            if (targetTab) {
                targetTab.classList.add('cdc-active');
            }
            
            // Update button states
            const tabButtons = document.querySelectorAll('.cdc-menu-btn');
            tabButtons.forEach(button => {
                const buttonTab = button.getAttribute('data-tab');
                button.classList.remove('cdc-active');
                if (buttonTab === tabName) {
                    button.classList.add('cdc-active');
                }
            });
            
            this.currentTab = tabName;
        },
        
        // Setup all event listeners
        setupEventListeners() {
            
            // Tab switching
            this.setupTabListeners();
            
            // Configuration toggle
            this.setupConfigToggle();
            
            // Configuration tabs
            this.setupConfigTabs();
            
            // Settings functionality
            this.setupSettingsEvents();
            
            // Data collection functionality
            this.setupDataCollectionEvents();
            
            // Data retrieval functionality
            this.setupDataRetrievalEvents();
            
            // Logs functionality
            this.setupLogsEvents();
        },
        
        // Setup tab switching listeners
        setupTabListeners() {
            const tabButtons = document.querySelectorAll('.cdc-menu-btn');
            
            tabButtons.forEach(button => {
                if (!button) return;
                
                const tabName = button.getAttribute('data-tab');
                if (!tabName) return;
                
                // Remove any existing listeners
                button.removeEventListener('click', this.handleTabClick);
                
                // Add new listener
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.switchTab(tabName);
                });
            });
        },
        
        // Setup configuration toggle
        setupConfigToggle() {
            const configToggle = document.getElementById('config-toggle');
            const configHeader = document.getElementById('config-header');
            
            if (configToggle) {
                // Remove existing listeners
                configToggle.removeEventListener('click', this.handleConfigToggle);
                
                // Add new listener
                configToggle.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.toggleConfigBlock();
                });
            }
            
            if (configHeader) {
                // Make the entire header clickable
                configHeader.addEventListener('click', (e) => {
                    if (e.target === configToggle) return; // Avoid double trigger
                    e.preventDefault();
                    e.stopPropagation();
                    this.toggleConfigBlock();
                });
            }
        },
        
        // Setup configuration tabs
        setupConfigTabs() {
            const configTabs = document.querySelectorAll('.cdc-config-tab');
            
            configTabs.forEach(tab => {
                if (!tab) return;
                
                const configType = tab.getAttribute('data-config');
                if (!configType) return;
                
                tab.addEventListener('click', (e) => {
                    e.preventDefault();
                    
                    if (tab.classList.contains('cdc-disabled')) {
                        return;
                    }
                    
                    // Update tab states
                    configTabs.forEach(t => t.classList.remove('cdc-active'));
                    tab.classList.add('cdc-active');
                    
                    // Show/hide config forms
                    this.showConfigForm(configType);
                });
            });
        },
        
        // Show specific config form
        showConfigForm(configType) {
            const newConfig = document.getElementById('new-config');
            const checkConfig = document.getElementById('check-config');
            
            if (newConfig) {
                newConfig.style.display = configType === 'new' ? 'block' : 'none';
            }
            if (checkConfig) {
                checkConfig.style.display = configType === 'check' ? 'block' : 'none';
            }
        },
        
        // Setup settings events
        setupSettingsEvents() {
            const apiKeyInput = document.getElementById('api-key');
            const toggleApiKeyBtn = document.getElementById('toggle-api-key');
            const saveSettingsBtn = document.getElementById('save-settings');
            
            if (toggleApiKeyBtn) {
                toggleApiKeyBtn.addEventListener('click', () => {
                    const input = document.getElementById('api-key');
                    if (input) {
                        if (input.type === 'password') {
                            input.type = 'text';
                            toggleApiKeyBtn.textContent = '🙈';
                        } else {
                            input.type = 'password';
                            toggleApiKeyBtn.textContent = '👁';
                        }
                    }
                });
            }
            
            if (saveSettingsBtn) {
                saveSettingsBtn.addEventListener('click', () => this.saveSettings());
            }
        },
        
        // Setup data collection events
        setupDataCollectionEvents() {
            const collectDataBtn = document.getElementById('collect-data');
            
            if (collectDataBtn) {
                collectDataBtn.addEventListener('click', () => this.collectData());
            }
        },
        
        // Setup data retrieval events
        setupDataRetrievalEvents() {
            const retrieveDataBtn = document.getElementById('retrieve-data');
            
            if (retrieveDataBtn) {
                retrieveDataBtn.addEventListener('click', () => this.retrieveData());
            }
        },
        
        // Setup logs events
        setupLogsEvents() {
            const refreshLogsBtn = document.getElementById('refresh-logs');
            const clearLogsBtn = document.getElementById('clear-logs');
            const exportLogsBtn = document.getElementById('export-logs');
            const logLevelFilter = document.getElementById('log-level-filter');
            const logCategoryFilter = document.getElementById('log-category-filter');
            const logSearch = document.getElementById('log-search');
            
            if (refreshLogsBtn) {
                refreshLogsBtn.addEventListener('click', () => this.refreshLogs());
            }
            
            if (clearLogsBtn) {
                clearLogsBtn.addEventListener('click', () => this.clearLogs());
            }
            
            if (exportLogsBtn) {
                exportLogsBtn.addEventListener('click', () => this.exportLogs());
            }
            
            if (logLevelFilter) {
                logLevelFilter.addEventListener('change', () => this.filterLogs());
            }
            
            if (logCategoryFilter) {
                logCategoryFilter.addEventListener('change', () => this.filterLogs());
            }
            
            if (logSearch) {
                logSearch.addEventListener('input', this.debounce(() => this.filterLogs(), 300));
            }
            
            // Load logs when initialized
            setTimeout(() => this.refreshLogs(), 1000);
        },
        
        // Initialize configuration block as collapsed
        initializeConfigBlock() {
            const configContent = document.getElementById('config-content');
            const configHeader = document.getElementById('config-header');
            const toggleBtn = document.getElementById('config-toggle');
            
            if (configContent && configHeader && toggleBtn) {
                configContent.classList.add('cdc-collapsed');
                configHeader.classList.add('cdc-collapsed');
                toggleBtn.textContent = '▶';
                this.isConfigExpanded = false;
            }
        },
        
        // Show loading indicator
        showLoading(show) {
            const loadingIndicator = document.getElementById('loading-indicator');
            if (loadingIndicator) {
                if (show) {
                    loadingIndicator.style.display = 'flex';
                    loadingIndicator.style.position = 'fixed';
                    loadingIndicator.style.top = '50%';
                    loadingIndicator.style.left = '50%';
                    loadingIndicator.style.transform = 'translate(-50%, -50%)';
                    loadingIndicator.style.zIndex = '2147483647';
                    loadingIndicator.style.width = '280px';
                    loadingIndicator.style.maxWidth = '90%';
                    loadingIndicator.style.background = 'rgba(255, 255, 255, 0.95)';
                    loadingIndicator.style.backdropFilter = 'blur(10px)';
                    loadingIndicator.style.borderRadius = '16px';
                    loadingIndicator.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
                    loadingIndicator.style.border = '2px solid #3b82f6';
                } else {
                    loadingIndicator.style.display = 'none';
                }
            }
        },
        
        // Show tab with loading indicator for specific actions
        showTabWithActionLoading(tabName, showLoading) {
            
            // Hide all tabs
            const tabContents = document.querySelectorAll('.cdc-tab-content');
            tabContents.forEach(content => {
                content.classList.remove('cdc-active');
            });
            
            // Show target tab
            const targetTab = document.getElementById(tabName);
            if (targetTab) {
                targetTab.classList.add('cdc-active');
                
                // Handle loading indicator if needed
                if (showLoading) {
                    const loadingIndicator = targetTab.querySelector('.cdc-tab-loading');
                    if (loadingIndicator) {
                        loadingIndicator.style.display = 'flex';
                    }
                }
            }
            
            // Update button states
            const tabButtons = document.querySelectorAll('.cdc-menu-btn');
            tabButtons.forEach(button => {
                const buttonTab = button.getAttribute('data-tab');
                button.classList.remove('cdc-active');
                if (buttonTab === tabName) {
                    button.classList.add('cdc-active');
                }
            });
            
            this.currentTab = tabName;
        },
        
        // Switch to specific tab with appropriate loading
        switchTab(tabName) {
            
            // For logs tab, show loading indicator and load data
            if (tabName === 'logs') {
                // Show tab with loading indicator
                this.showTabWithActionLoading(tabName, true);
                
                // Load logs data asynchronously
                setTimeout(() => {
                    this.refreshLogs().finally(() => {
                        // Hide loading indicator for logs tab
                        const logsTab = document.getElementById('logs');
                        if (logsTab) {
                            const loadingIndicator = logsTab.querySelector('.cdc-tab-loading');
                            if (loadingIndicator) {
                                loadingIndicator.style.display = 'none';
                            }
                        }
                    });
                }, 100);
            } else if (tabName === 'data-retrieval') {
                // Show data retrieval tab without loading indicator
                this.showTabWithActionLoading(tabName, false);
            } else {
                // Show other tabs immediately
                this.showTabWithActionLoading(tabName, false);
            }
            
            this.currentTab = tabName;
        },
        
        // Collect data
        collectData() {
            console.log('Starting data collection process...');

            // Always refresh API key from storage before operation to prevent reset
            this.loadSettings(0, () => {
                if (!this.apiKey) {
                    this.showStatus('Сначала настройте API ключ в разделе настроек', 'error');
                    this.switchTab('settings');
                    return;
                }

                // Show loading indicator immediately
                this.showLoading(true);
                this.showStatus('Сбор данных со страницы...', 'info');

                // Send request to content script
                this.sendMessageToContentScript('collectData', {}, (response) => {
                    console.log('Received response for collectData:', response);
                    this.showLoading(false);

                    if (response && response.success) {
                        const stats = response.stats || {};
                        const processed = stats.processed || 0;
                        const created = stats.created || 0;
                        const updated = stats.updated || 0;
                        const skipped = stats.skipped || 0;

                        let statusMessage = `Данные обработаны! Обработано: ${processed}`;
                        if (created > 0) statusMessage += `, новых: ${created}`;
                        if (updated > 0) statusMessage += `, обновлено: ${updated}`;
                        if (skipped > 0) statusMessage += `, пропущено: ${skipped}`;

                        this.showStatus(statusMessage, 'success');
                        console.log('Data collection successful:', stats);

                        // Log detailed operation info
                        if (window.ExtensionLogger && typeof window.ExtensionLogger.info === 'function') {
                            window.ExtensionLogger.info('Data collection completed', {
                                processed: processed,
                                created: created,
                                updated: updated,
                                skipped: skipped,
                                timestamp: new Date().toISOString()
                            }, 'data-collection');
                        }
                    } else {
                        const errorMessage = response?.error || 'Неизвестная ошибка';
                        const errorCode = response?.code || '';
                        console.error('Data collection failed:', errorMessage);
                        this.showStatus('Ошибка при сборе данных: ' + errorMessage + (errorCode ? ' (' + errorCode + ')' : ''), 'error');

                        // Log error
                        if (window.ExtensionLogger && typeof window.ExtensionLogger.error === 'function') {
                            window.ExtensionLogger.error('Data collection failed', {
                                error: errorMessage,
                                errorCode: errorCode,
                                timestamp: new Date().toISOString()
                            }, 'data-collection');
                        }
                    }
                });
            });
        },
        
        // Retrieve data
        retrieveData() {
            // Always refresh API key from storage before operation to prevent reset
            this.loadSettings(0, () => {
                if (!this.apiKey) {
                    this.showStatus('Сначала настройте API ключ в разделе настроек', 'error');
                    this.switchTab('settings');
                    return;
                }

                // Log operation start
                if (window.ExtensionLogger && typeof window.ExtensionLogger.info === 'function') {
                    window.ExtensionLogger.info('Starting data retrieval from server', {
                        serverUrl: this.serverUrl,
                        timestamp: new Date().toISOString()
                    }, 'data-retrieval');
                }

                // Show loading indicator for data retrieval tab
                const dataRetrievalTab = document.getElementById('data-retrieval');
                let loadingIndicator = null;
    
                if (dataRetrievalTab) {
                    loadingIndicator = dataRetrievalTab.querySelector('.cdc-tab-loading');
                    if (loadingIndicator) {
                        loadingIndicator.style.display = 'flex';
                        loadingIndicator.style.position = 'fixed';
                        loadingIndicator.style.top = '50%';
                        loadingIndicator.style.left = '50%';
                        loadingIndicator.style.transform = 'translate(-50%, -50%)';
                        loadingIndicator.style.zIndex = '2147483647';
                    }
                }

                this.showStatus('Загрузка данных с сервера...', 'info');

                // Send request to content script
                this.sendMessageToContentScript('retrieveData', {
                    apiKey: this.apiKey,
                    serverUrl: this.serverUrl
                }, (response) => {
                    console.log('Received response for retrieveData:', response);

                    // Hide loading indicator
                    if (loadingIndicator) {
                        loadingIndicator.style.display = 'none';
                    }

                    if (response && response.success) {
                        const data = response.data;
                        const totalCreated = data.createdToday?.count || 0;
                        const totalUpdated = data.updatedToday?.count || 0;
                        const totalItems = totalCreated + totalUpdated;

                        // Log successful operation
                        if (window.ExtensionLogger && typeof window.ExtensionLogger.info === 'function') {
                            window.ExtensionLogger.info('Data retrieval completed successfully', {
                                totalItems: totalItems,
                                created: totalCreated,
                                updated: totalUpdated,
                                serverUrl: this.serverUrl,
                                timestamp: new Date().toISOString()
                            }, 'data-retrieval');
                        }

                        if (totalItems > 0) {
                            this.generateAndDownloadFile(data);
                            this.displayRetrievedData(data);
                            this.showStatus(`Данные загружены! Всего записей: ${totalItems} (новых: ${totalCreated}, обновлено: ${totalUpdated})`, 'success');
                        } else {
                            this.showStatus('Данных за сегодня не найдено', 'warning');
                            // Clear results container
                            const resultsContainer = document.getElementById('data-results');
                            if (resultsContainer) {
                                resultsContainer.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 20px;">Данных за сегодня не найдено</p>';
                            }
                        }
                    } else {
                        const errorMessage = response?.error || 'Неизвестная ошибка';
                        const errorCode = response?.code || '';

                        // Log error
                        if (window.ExtensionLogger && typeof window.ExtensionLogger.error === 'function') {
                            window.ExtensionLogger.error('Data retrieval failed', {
                                error: errorMessage,
                                errorCode: errorCode,
                                serverUrl: this.serverUrl,
                                timestamp: new Date().toISOString()
                            }, 'data-retrieval');
                        }

                        this.showStatus('Ошибка при загрузке данных: ' + errorMessage + (errorCode ? ' (' + errorCode + ')' : ''), 'error');
                    }
                });
            });
        },
        
        // Generate and download file
        generateAndDownloadFile(data) {
            try {
                const allCases = [...data.createdToday.cases, ...data.updatedToday.cases];
                
                if (allCases.length === 0) {
                    this.showStatus('Нет данных для сохранения', 'warning');
                    return;
                }
                
                let fileContent = '';
                
                allCases.forEach((caseItem, index) => {
                    fileContent += `Регистрационный номер: ${caseItem.registrationNumber || ''}\n`;
                    fileContent += `Номер дела: ${caseItem.caseNumber || ''}\n`;
                    fileContent += `Входящий номер: ${caseItem.incomingNumber}\n`;
                    fileContent += `Дата поступления: ${this.formatDate(caseItem.receiptDate)}\n`;
                    fileContent += `Взыскатель: ${caseItem.claimant}\n`;
                    fileContent += `Должник: ${caseItem.debtor}\n`;
                    fileContent += `Сумма долга: ${caseItem.debtAmount || 0}\n`;
                    fileContent += `Решение: ${caseItem.decision || ''}\n`;
                    fileContent += `Наименование суда: ${caseItem.courtName}\n`;
                    fileContent += `Дата создания: ${this.formatDateTime(caseItem.createdAt)}\n`;
                    fileContent += `Дата обновления: ${this.formatDateTime(caseItem.updatedAt)}\n`;
                    
                    if (index < allCases.length - 1) {
                        fileContent += '\n\n\n';
                    }
                });
                
                // Generate filename
                const today = new Date().toISOString().split('T')[0];
                const randomInt = Math.floor(Math.random() * 10000);
                const filename = `${today}-${randomInt}.txt`;
                
                // Create and download file
                const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
            } catch (error) {
                this.showStatus('Ошибка при создании файла', 'error');
            }
        },
        
        // Display retrieved data
        displayRetrievedData(data) {
            const resultsContainer = document.getElementById('data-results');
            if (!resultsContainer) return;
            
            resultsContainer.innerHTML = '';
            
            const totalItems = data.createdToday.count + data.updatedToday.count;
            
            if (totalItems === 0) {
                resultsContainer.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 20px;">Данных за сегодня не найдено</p>';
                return;
            }
            
            // Create summary
            const summaryDiv = document.createElement('div');
            summaryDiv.className = 'data-summary';
            summaryDiv.innerHTML = `
                <h4 style="margin: 0 0 10px 0; color: #1f2937;">Сводка за ${this.formatDate(data.summary.date)}</h4>
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
            
            // Display cases
            if (data.createdToday.count > 0) {
                const createdSection = document.createElement('div');
                createdSection.innerHTML = '<h5 style="margin: 15px 0 10px 0; color: #059669;">Новые дела</h5>';
                resultsContainer.appendChild(createdSection);
                
                data.createdToday.cases.forEach(item => {
                    resultsContainer.appendChild(this.createCaseElement(item, 'created'));
                });
            }
            
            if (data.updatedToday.count > 0) {
                const updatedSection = document.createElement('div');
                updatedSection.innerHTML = '<h5 style="margin: 15px 0 10px 0; color: #d97706;">Обновленные дела</h5>';
                resultsContainer.appendChild(updatedSection);
                
                data.updatedToday.cases.forEach(item => {
                    resultsContainer.appendChild(this.createCaseElement(item, 'updated'));
                });
            }
        },
        
        // Create case element
        createCaseElement(caseData, type) {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'cdc-data-item';
            itemDiv.style.borderLeft = `3px solid ${type === 'created' ? '#10b981' : '#f59e0b'}`;
            
            const caseNumber = caseData.caseNumber || caseData.registrationNumber || 'Не указан';
            const claimant = caseData.claimant || 'Не указан';
            const debtor = caseData.debtor || 'Не указан';
            const amount = this.formatAmount(caseData.debtAmount);
            const receiptDate = this.formatDate(caseData.receiptDate);
            const court = caseData.courtName || 'Не указан';
            const timestamp = type === 'created' ? 
                this.formatDateTime(caseData.createdAt) : 
                this.formatDateTime(caseData.updatedAt);
            
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
        },
        
        // Logs functionality
        async refreshLogs() {
            const logsTab = document.getElementById('logs');
            
            try {
                if (window.ExtensionLogger && typeof window.ExtensionLogger.getLogs === 'function') {
                    const logs = await window.ExtensionLogger.getLogs({ limit: 100 });
                    const stats = await window.ExtensionLogger.getStats();

                    this.displayLogStats(stats);
                    this.displayLogs(logs);
                } else {
                    console.warn('ExtensionLogger not available or functions missing');
                    this.displayLogs([]);
                    this.displayLogStats({ total: 0, byLevel: {}, byCategory: {} });
                }
            } catch (error) {
                console.error('Error refreshing logs:', error);
                this.showStatus('Ошибка при загрузке логов: ' + error.message, 'error');
            }
        },
        
        async filterLogs() {
            try {
                if (!window.ExtensionLogger || typeof window.ExtensionLogger.getLogs !== 'function') {
                    console.warn('ExtensionLogger not available for filtering');
                    return;
                }
                
                const levelFilter = document.getElementById('log-level-filter')?.value;
                const categoryFilter = document.getElementById('log-category-filter')?.value;
                const searchText = document.getElementById('log-search')?.value;
                
                const options = { limit: 100 };
                
                if (levelFilter) options.level = levelFilter;
                if (categoryFilter) options.category = categoryFilter;
                if (searchText) options.search = searchText;
                
                const logs = await window.ExtensionLogger.getLogs(options);
                this.displayLogs(logs);
            } catch (error) {
                console.error('Error filtering logs:', error);
                this.showStatus('Ошибка при фильтрации логов: ' + error.message, 'error');
            }
        },
        
        async clearLogs() {
            if (!confirm('Вы уверены, что хотите удалить все логи?')) {
                return;
            }
            
            try {
                if (window.ExtensionLogger && typeof window.ExtensionLogger.clearLogs === 'function') {
                    await window.ExtensionLogger.clearLogs();
                    await this.refreshLogs();
                    this.showStatus('Логи очищены', 'success');
                } else {
                    this.showStatus('Функция очистки логов недоступна', 'error');
                }
            } catch (error) {
                this.showStatus('Ошибка при очистке логов: ' + error.message, 'error');
            }
        },
        
        async exportLogs() {
            try {
                if (!window.ExtensionLogger || typeof window.ExtensionLogger.exportLogs !== 'function') {
                    this.showStatus('Экспорт логов недоступен', 'error');
                    return;
                }
                
                const logsData = await window.ExtensionLogger.exportLogs('json');
                
                const blob = new Blob([logsData], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `court-data-collector-logs-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                this.showStatus('Логи экспортированы', 'success');
            } catch (error) {
                this.showStatus('Ошибка при экспорте логов: ' + error.message, 'error');
            }
        },
        
        displayLogStats(stats) {
            const statsContainer = document.getElementById('log-stats');
            if (!statsContainer) {
                console.warn('Log stats container not found');
                return;
            }
            
            try {
                // Create stats element using DOM methods to avoid TrustedHTML policy issues
                const statsGrid = document.createElement('div');
                statsGrid.className = 'cdc-stats-grid';
                
                // Total stats item
                const totalItem = document.createElement('div');
                totalItem.className = 'cdc-stat-item';
                totalItem.innerHTML = `
                    <span class="cdc-stat-label">Всего:</span>
                    <span class="cdc-stat-value">${stats.total || 0}</span>
                `;
                
                // Error stats item
                const errorItem = document.createElement('div');
                errorItem.className = 'cdc-stat-item cdc-error';
                errorItem.innerHTML = `
                    <span class="cdc-stat-label">Ошибки:</span>
                    <span class="cdc-stat-value">${stats.byLevel?.ERROR || 0}</span>
                `;
                
                // Warning stats item
                const warnItem = document.createElement('div');
                warnItem.className = 'cdc-stat-item cdc-warn';
                warnItem.innerHTML = `
                    <span class="cdc-stat-label">Предупреждения:</span>
                    <span class="cdc-stat-value">${stats.byLevel?.WARN || 0}</span>
                `;
                
                // Info stats item
                const infoItem = document.createElement('div');
                infoItem.className = 'cdc-stat-item cdc-info';
                infoItem.innerHTML = `
                    <span class="cdc-stat-label">Информация:</span>
                    <span class="cdc-stat-value">${stats.byLevel?.INFO || 0}</span>
                `;
                
                // Clear container and append items
                statsContainer.innerHTML = '';
                statsGrid.appendChild(totalItem);
                statsGrid.appendChild(errorItem);
                statsGrid.appendChild(warnItem);
                statsGrid.appendChild(infoItem);
                statsContainer.appendChild(statsGrid);
            } catch (error) {
                console.error('Error displaying log stats:', error);
            }
        },
        
        displayLogs(logs) {
            const logsContainer = document.getElementById('log-entries');
            if (!logsContainer) {
                console.warn('Log entries container not found');
                return;
            }
            
            try {
                // Clear container
                logsContainer.innerHTML = '';
                
                if (logs.length === 0) {
                    const noLogsElement = document.createElement('p');
                    noLogsElement.className = 'cdc-no-logs';
                    noLogsElement.textContent = 'Логи не найдены';
                    logsContainer.appendChild(noLogsElement);
                    return;
                }
                
                // Create log entries using DOM methods
                logs.forEach(log => {
                    const timestamp = new Date(log.timestamp).toLocaleString('ru-RU');
                    const levelClass = 'cdc-' + log.level.toLowerCase();

                    // Create human-readable context string
                    let contextStr = '';
                    if (log.context && typeof log.context === 'object' && Object.keys(log.context).length > 0) {
                        try {
                            // Format context as readable key-value pairs
                            const contextLines = [];
                            for (const [key, value] of Object.entries(log.context)) {
                                if (value !== undefined && value !== null) {
                                    contextLines.push(`${key}: ${String(value)}`);
                                }
                            }
                            contextStr = contextLines.join('\n');
                        } catch (error) {
                            contextStr = 'Error formatting context';
                        }
                    }

                    // Create log entry container
                    const logEntry = document.createElement('div');
                    logEntry.className = `cdc-log-entry ${levelClass}`;

                    // Create log header
                    const logHeader = document.createElement('div');
                    logHeader.className = 'cdc-log-header';

                    const levelSpan = document.createElement('span');
                    levelSpan.className = 'cdc-log-level';
                    levelSpan.textContent = log.level;

                    const categorySpan = document.createElement('span');
                    categorySpan.className = 'cdc-log-category';
                    categorySpan.textContent = `[${log.category || 'general'}]`;

                    const timeSpan = document.createElement('span');
                    timeSpan.className = 'cdc-log-timestamp';
                    timeSpan.textContent = timestamp;

                    logHeader.appendChild(levelSpan);
                    logHeader.appendChild(categorySpan);
                    logHeader.appendChild(timeSpan);

                    // Create log message
                    const messageDiv = document.createElement('div');
                    messageDiv.className = 'cdc-log-message';
                    messageDiv.textContent = log.message || 'No message';

                    // Append elements to log entry
                    logEntry.appendChild(logHeader);
                    logEntry.appendChild(messageDiv);

                    // Add context if available
                    if (contextStr) {
                        const contextDiv = document.createElement('div');
                        contextDiv.className = 'cdc-log-context';

                        const preElement = document.createElement('pre');
                        preElement.textContent = contextStr;
                        preElement.style.fontSize = '11px';
                        preElement.style.lineHeight = '1.3';
                        preElement.style.margin = '4px 0';
                        preElement.style.whiteSpace = 'pre-wrap';
                        preElement.style.wordBreak = 'break-word';

                        contextDiv.appendChild(preElement);
                        logEntry.appendChild(contextDiv);
                    }

                    // Add to container
                    logsContainer.appendChild(logEntry);
                });
            } catch (error) {
                console.error('Error displaying logs:', error);
                logsContainer.innerHTML = '';
                const errorElement = document.createElement('p');
                errorElement.className = 'cdc-no-logs';
                errorElement.textContent = 'Ошибка при отображении логов';
                logsContainer.appendChild(errorElement);
            }
        },
        
        // Show tab with loading indicator
        showTabWithLoading(tabName) {
            // Hide all tabs
            const tabContents = document.querySelectorAll('.cdc-tab-content');
            tabContents.forEach(content => {
                content.classList.remove('cdc-active');
            });
            
            // Show target tab
            const targetTab = document.getElementById(tabName);
            if (targetTab) {
                targetTab.classList.add('cdc-active');
                
                // For tabs that need data loading, show loading indicator
                if (tabName === 'logs') {
                    // Show loading indicator
                    const loadingIndicator = targetTab.querySelector('.cdc-tab-loading');
                    if (loadingIndicator) {
                        loadingIndicator.style.display = 'flex';
                    }
                    
                    // Load logs data asynchronously
                    setTimeout(() => {
                        this.refreshLogs().finally(() => {
                            // Hide loading indicator
                            if (loadingIndicator) {
                                loadingIndicator.style.display = 'none';
                            }
                        });
                    }, 100);
                } else if (tabName === 'data-retrieval') {
                    // Show loading indicator for data retrieval tab if needed
                    const loadingIndicator = targetTab.querySelector('.cdc-tab-loading');
                    if (loadingIndicator) {
                        // Only show if there's actual data loading happening
                        // For now we just show the tab without loading indicator
                    }
                }
            }
        },
        
        // Toggle configuration block
        toggleConfigBlock() {
            const configContent = document.getElementById('config-content');
            const toggleBtn = document.getElementById('config-toggle');
            const configHeader = document.getElementById('config-header');
            
            if (configContent && toggleBtn && configHeader) {
                this.isConfigExpanded = !this.isConfigExpanded;
                
                if (this.isConfigExpanded) {
                    configContent.classList.remove('cdc-collapsed');
                    configHeader.classList.remove('cdc-collapsed');
                    toggleBtn.textContent = '▼';
                } else {
                    configContent.classList.add('cdc-collapsed');
                    configHeader.classList.add('cdc-collapsed');
                    toggleBtn.textContent = '▶';
                }
            }
        },
        
        // Load settings from storage with retry logic
        loadSettings(retryCount = 0, callback = null) {

            this.sendMessageToContentScript('getSettings', {}, (response) => {
                if (response && response.success) {
                    const settings = response.settings;
                    this.apiKey = settings.apiKey || '';
                    this.serverUrl = settings.serverUrl || 'http://localhost:3000';

                    // Update UI
                    const apiKeyInput = document.getElementById('api-key');
                    if (apiKeyInput) {
                        apiKeyInput.value = this.apiKey;
                    }

                    // Call callback if provided
                    if (callback && typeof callback === 'function') {
                        callback();
                    }
                } else {
                    console.error('Failed to load settings:', response?.error);
                    // Retry with exponential backoff, max 3 retries
                    if (retryCount < 3) {
                        const delay = Math.min(1000 * Math.pow(2, retryCount), 5000); // Max 5 seconds
                        console.log(`Retrying to load settings in ${delay}ms (attempt ${retryCount + 1}/3)...`);
                        setTimeout(() => {
                            this.loadSettings(retryCount + 1, callback);
                        }, delay);
                    } else {
                        console.warn('Failed to load settings after 3 attempts, using defaults');
                        // Use defaults if loading fails
                        this.apiKey = '';
                        this.serverUrl = 'http://localhost:3000';
                        const apiKeyInput = document.getElementById('api-key');
                        if (apiKeyInput) {
                            apiKeyInput.value = this.apiKey;
                        }

                        // Call callback even on failure
                        if (callback && typeof callback === 'function') {
                            callback();
                        }
                    }
                }
            });
        },
        
        // Save settings to storage with retry logic
        saveSettings(retryCount = 0) {
            const apiKeyInput = document.getElementById('api-key');

            if (apiKeyInput) {
                const newApiKey = apiKeyInput.value.trim();
                console.log('New API key:', newApiKey);

                if (!newApiKey) {
                    this.showStatus('API ключ не может быть пустым', 'error');
                    return;
                }

                const settings = {
                    apiKey: newApiKey,
                    serverUrl: this.serverUrl
                };

                this.sendMessageToContentScript('saveSettings', { settings: settings }, (response) => {
                    if (response && response.success) {
                        this.apiKey = newApiKey;
                        this.showStatus('Настройки сохранены', 'success');
                    } else {
                        console.error('Error saving to chrome.storage:', response?.error);
                        if (retryCount < 3) {
                            const delay = Math.min(1000 * Math.pow(2, retryCount), 5000); // Max 5 seconds
                            console.log(`Retrying save settings in ${delay}ms (attempt ${retryCount + 1}/3)...`);
                            setTimeout(() => {
                                this.saveSettings(retryCount + 1);
                            }, delay);
                        } else {
                            this.showStatus('Ошибка при сохранении настроек: ' + (response?.error || 'Неизвестная ошибка'), 'error');
                        }
                    }
                });
            } else {
                this.showStatus('Ошибка: поле API ключа не найдено', 'error');
                console.error('API key input not found');
            }
        },
        
        // Show status message
        showStatus(message, type = '') {
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
        },
        
        // Utility functions
        formatAmount(amount) {
            if (!amount) return 'Не указана';
            
            if (typeof amount === 'string' && amount.includes('BYN')) {
                return amount;
            }
            
            if (typeof amount === 'number') {
                return `${amount.toLocaleString('ru')} BYN`;
            }
            
            return amount.toString();
        },
        
        formatDate(dateString) {
            if (!dateString) return 'Не указана';
            
            try {
                const date = new Date(dateString);
                return date.toLocaleDateString('ru-RU');
            } catch {
                return dateString;
            }
        },
        
        formatDateTime(dateString) {
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
        },
        
        debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },
        
        // Debug functions for testing
        debug: {
            checkElements() {
                const elements = {
                    sidebarContainer: document.getElementById('court-data-collector-sidebar'),
                    tabButtons: document.querySelectorAll('.cdc-menu-btn'),
                    tabContents: document.querySelectorAll('.cdc-tab-content'),
                    configToggle: document.getElementById('config-toggle'),
                    configTabs: document.querySelectorAll('.cdc-config-tab'),
                    configContent: document.getElementById('config-content'),
                    configHeader: document.getElementById('config-header')
                };
                
                return elements;
            },
            
            testTabSwitch(tabName) {
                CourtDataCollectorSidebar.switchTab(tabName);
            },
            
            getCurrentTab() {
                return CourtDataCollectorSidebar.currentTab;
            },
            
            isConfigExpanded() {
                return CourtDataCollectorSidebar.isConfigExpanded;
            },
            
            checkDOMReadiness() {
                const requiredElements = [
                    'court-data-collector-sidebar',
                    'config-content',
                    'config-header',
                    'config-toggle'
                ];
                
                const status = {};
                requiredElements.forEach(id => {
                    const element = document.getElementById(id);
                    status[id] = {
                        exists: !!element,
                        hasAttributes: element ? element.hasAttributes() : false,
                        classList: element ? Array.from(element.classList) : []
                    };
                });
                
                return status;
            }
        }
    };
    
        // Assign to window
        window.CourtDataCollectorSidebar = CourtDataCollectorSidebar;

        // Auto-initialize if DOM is ready
        if (document.readyState !== 'loading') {
            setTimeout(() => {
                try {
                    if (window.CourtDataCollectorSidebar && typeof window.CourtDataCollectorSidebar.init === 'function') {
                        CourtDataCollectorSidebar.init();
                    }
                } catch (e) {
                    console.error('Error initializing sidebar:', e);
                }
            }, 100);
        } else {
            document.addEventListener('DOMContentLoaded', () => {
                try {
                    if (window.CourtDataCollectorSidebar && typeof window.CourtDataCollectorSidebar.init === 'function') {
                        CourtDataCollectorSidebar.init();
                    }
                } catch (e) {
                    console.error('Error initializing sidebar after DOMContentLoaded:', e);
                }
            });
        }

        // Set up debug functions for testing
        window.testSidebar = {
            checkElements() {
                return CourtDataCollectorSidebar.debug.checkElements();
            },
            switchTab(tabName) {
                return CourtDataCollectorSidebar.debug.testTabSwitch(tabName);
            },
            getCurrentTab() {
                return CourtDataCollectorSidebar.debug.getCurrentTab();
            },
            toggleConfig() {
                const toggle = document.getElementById('config-toggle');
                if (toggle) {
                    toggle.click();
                }
            },
            debugInfo() {
                return {
                    isInitialized: CourtDataCollectorSidebar.isInitialized,
                    currentTab: CourtDataCollectorSidebar.currentTab,
                    isConfigExpanded: CourtDataCollectorSidebar.isConfigExpanded,
                    hasCourtDataCollectorSidebar: !!window.CourtDataCollectorSidebar,
                    sidebarMethods: window.CourtDataCollectorSidebar ? Object.keys(window.CourtDataCollectorSidebar) : []
                };
            }
        };
}