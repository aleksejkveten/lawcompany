
// Enhanced sidebar functionality for Court Data Collector with improved reliability
// Simplified and more robust implementation

// Prevent duplicate script execution
if (window.sidebarScriptLoaded || window.CourtDataCollectorSidebar) {
    console.log('Sidebar script already loaded, skipping...');
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
        
        // Initialize the sidebar
        init() {
            console.log('Initializing Court Data Collector Sidebar...');
            
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.initializeSidebar());
            } else {
                this.initializeSidebar();
            }
        },
        
        // Main initialization function
        initializeSidebar() {
            console.log('Setting up sidebar...');
            
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
            
            // Show default tab
            this.showTab('data-collection');
            
            // Mark as initialized
            this.isInitialized = true;
            console.log('Sidebar initialized successfully');
        },
        
        // Setup all event listeners
        setupEventListeners() {
            console.log('Setting up event listeners...');
            
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
        
        // Switch to specific tab
        switchTab(tabName) {
            console.log(`Switching to tab: ${tabName}`);
            
            // Update button states
            const tabButtons = document.querySelectorAll('.cdc-menu-btn');
            tabButtons.forEach(button => {
                const buttonTab = button.getAttribute('data-tab');
                button.classList.remove('cdc-active');
                if (buttonTab === tabName) {
                    button.classList.add('cdc-active');
                }
            });
            
            // Show/hide tab content
            this.showTab(tabName);
            this.currentTab = tabName;
        },
        
        // Show specific tab content
        showTab(tabName) {
            const tabContents = document.querySelectorAll('.cdc-tab-content');
            tabContents.forEach(content => {
                content.classList.remove('cdc-active');
            });
            
            const targetTab = document.getElementById(tabName);
            if (targetTab) {
                targetTab.classList.add('cdc-active');
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
                
                console.log(`Config expanded: ${this.isConfigExpanded}`);
            }
        },
        
        // Load settings from storage
        loadSettings() {
            if (typeof chrome !== 'undefined' && chrome.runtime) {
                chrome.runtime.sendMessage(
                    { action: 'getSettings' },
                    (response) => {
                        if (response && response.success) {
                            this.apiKey = response.settings.apiKey || '';
                            this.serverUrl = response.settings.serverUrl || 'http://localhost:3000';
                            
                            // Update UI
                            const apiKeyInput = document.getElementById('api-key');
                            if (apiKeyInput) {
                                apiKeyInput.value = this.apiKey;
                            }
                        }
                    }
                );
            }
        },
        
        // Save settings to storage
        saveSettings() {
            const apiKeyInput = document.getElementById('api-key');
            
            if (apiKeyInput) {
                const newApiKey = apiKeyInput.value.trim();
                
                if (!newApiKey) {
                    this.showStatus('API ключ не может быть пустым', 'error');
                    return;
                }
                
                const settings = {
                    apiKey: newApiKey,
                    serverUrl: this.serverUrl
                };
                
                if (typeof chrome !== 'undefined' && chrome.runtime) {
                    chrome.runtime.sendMessage(
                        { 
                            action: 'saveSettings',
                            settings: settings
                        },
                        (response) => {
                            if (response && response.success) {
                                this.apiKey = newApiKey;
                                this.showStatus('Настройки сохранены', 'success');
                            } else {
                                this.showStatus('Ошибка при сохранении настроек', 'error');
                            }
                        }
                    );
                }
            }
        },
        
        // Collect data
        collectData() {
            if (!this.apiKey) {
                this.showStatus('Сначала настройте API ключ в разделе настроек', 'error');
                this.switchTab('settings');
                return;
            }
            
            this.showLoading(true);
            this.showStatus('Сбор данных...', 'info');
            
            if (typeof chrome !== 'undefined' && chrome.runtime) {
                chrome.runtime.sendMessage(
                    { action: 'collectData' },
                    (response) => {
                        this.showLoading(false);
                        if (response && response.success) {
                            this.showStatus('Данные собраны и отправлены на сервер', 'success');
                        } else {
                            this.showStatus('Ошибка при сборе данных: ' + (response?.error || 'Неизвестная ошибка'), 'error');
                        }
                    }
                );
            } else {
                this.showLoading(false);
                this.showStatus('Ошибка: Chrome API недоступен', 'error');
            }
        },
        
        // Retrieve data
        retrieveData() {
            if (!this.apiKey) {
                this.showStatus('Сначала настройте API ключ в разделе настроек', 'error');
                this.switchTab('settings');
                return;
            }
            
            this.showLoading(true);
            this.showStatus('Загрузка данных...', 'info');
            
            if (typeof chrome !== 'undefined' && chrome.runtime) {
                chrome.runtime.sendMessage(
                    { 
                        action: 'retrieveData',
                        apiKey: this.apiKey,
                        serverUrl: this.serverUrl
                    },
                    (response) => {
                        this.showLoading(false);
                        
                        if (response && response.success) {
                            this.generateAndDownloadFile(response.data);
                            this.displayRetrievedData(response.data);
                            this.showStatus(`Данные загружены! Новых: ${response.data.summary.totalCreated}, обновлено: ${response.data.summary.totalUpdated}`, 'success');
                        } else {
                            this.showStatus('Ошибка при загрузке данных: ' + (response?.error || 'Неизвестная ошибка'), 'error');
                        }
                    }
                );
            } else {
                this.showLoading(false);
                this.showStatus('Ошибка: Chrome API недоступен', 'error');
            }
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
            try {
                if (window.ExtensionLogger && window.ExtensionLogger.getLogs) {
                    const logs = await window.ExtensionLogger.getLogs({ limit: 100 });
                    const stats = await window.ExtensionLogger.getStats();
                    
                    this.displayLogStats(stats);
                    this.displayLogs(logs);
                } else {
                    this.displayLogs([]);
                    this.displayLogStats({ total: 0, byLevel: {}, byCategory: {} });
                }
            } catch (error) {
                console.error('Error refreshing logs:', error);
            }
        },
        
        async filterLogs() {
            try {
                if (!window.ExtensionLogger || !window.ExtensionLogger.getLogs) return;
                
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
            }
        },
        
        async clearLogs() {
            if (!confirm('Вы уверены, что хотите удалить все логи?')) {
                return;
            }
            
            try {
                if (window.ExtensionLogger && window.ExtensionLogger.clearLogs) {
                    await window.ExtensionLogger.clearLogs();
                    await this.refreshLogs();
                    this.showStatus('Логи очищены', 'success');
                }
            } catch (error) {
                this.showStatus('Ошибка при очистке логов', 'error');
            }
        },
        
        async exportLogs() {
            try {
                if (!window.ExtensionLogger || !window.ExtensionLogger.exportLogs) {
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
                this.showStatus('Ошибка при экспорте логов', 'error');
            }
        },
        
        displayLogStats(stats) {
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
        },
        
        displayLogs(logs) {
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
        },
        
        // Utility functions
        showLoading(show) {
            const loadingIndicator = document.getElementById('loading-indicator');
            if (loadingIndicator) {
                loadingIndicator.style.display = show ? 'flex' : 'none';
            }
        },
        
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
                CourtDataCollectorSidebar.init();
            } catch (e) {
                console.error('Error initializing sidebar:', e);
            }
        }, 100);
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            try {
                CourtDataCollectorSidebar.init();
            } catch (e) {
                console.error('Error initializing sidebar:', e);
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
    
    console.log('Court Data Collector Sidebar script loaded successfully');
}