// Background script for Chrome extension

// Handle extension icon click
chrome.action.onClicked.addListener(async (tab) => {
    // Check if tab URL is allowed
    if (!isValidTabUrl(tab.url)) {
        return;
    }
    
    try {
        // Inject content script if not already injected
        await ensureContentScriptInjected(tab.id);
        
        // Send message to content script to toggle sidebar
        const response = await chrome.tabs.sendMessage(tab.id, {
            action: 'toggleSidebar'
        });
    } catch (error) {
        // If content script is not ready, inject it
        try {
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['content.js']
            });
            
            // Wait a moment for content script to initialize
            setTimeout(async function retryToggleSidebar() {
                try {
                    await chrome.tabs.sendMessage(tab.id, {
                        action: 'toggleSidebar'
                    });
                } catch (retryError) {
                    // Silent error handling
                }
            }, 500);
        } catch (injectionError) {
            // Silent error handling
        }
    }
});

// Check if URL is valid for content script injection
function isValidTabUrl(url) {
    if (!url) return false;
    
    // Disallow chrome:// URLs, extension pages, and other restricted URLs
    const restrictedPatterns = [
        'chrome://',
        'chrome-extension://',
        'moz-extension://',
        'edge-extension://',
        'about:',
        'data:',
        'javascript:'
    ];
    
    const isValid = !restrictedPatterns.some(pattern => url.startsWith(pattern));
    return isValid;
}

// Ensure content script is injected
async function ensureContentScriptInjected(tabId) {
    try {
        // Get tab info first to check URL
        const tab = await chrome.tabs.get(tabId);
        if (!isValidTabUrl(tab.url)) {
            throw new Error(`Cannot inject into URL: ${tab.url}`);
        }
        
        // Try to ping the content script
        await chrome.tabs.sendMessage(tabId, { action: 'ping' });
    } catch (error) {
        // Content script not present, inject it
        await chrome.scripting.executeScript({
            target: { tabId },
            files: ['content.js']
        });
        
        // Also inject CSS
        await chrome.scripting.insertCSS({
            target: { tabId },
            files: ['assets/styles/content.css']
        });
    }
}

// Handle extension installation
chrome.runtime.onInstalled.addListener(function handleExtensionInstall(details) {
    if (details.reason === 'install') {
        // Initialize storage with default values only on fresh install
        chrome.storage.local.set({
            dataCollectionEnabled: false,
            lastDataCollection: null,
            collectedData: [],
            apiKey: '',
            serverUrl: 'http://localhost:3000',
            autoCollect: false,
            collectNew: true,
            collectUpdates: false
        });
    } else if (details.reason === 'update') {
        // On update, ensure critical settings exist and migrate if needed
        migrateSettings();
    }
});

// Migrate settings to handle any changes between versions
function migrateSettings() {
    chrome.storage.local.get(null, function(settings) {
        let needsUpdate = false;
        const updatedSettings = { ...settings };

        // Ensure critical settings exist with defaults
        if (typeof updatedSettings.apiKey === 'undefined') {
            updatedSettings.apiKey = '';
            needsUpdate = true;
        }
        if (typeof updatedSettings.serverUrl === 'undefined') {
            updatedSettings.serverUrl = 'http://localhost:3000';
            needsUpdate = true;
        }

        // If any settings were missing, save them
        if (needsUpdate) {
            chrome.storage.local.set(updatedSettings, function() {
                console.log('Settings migrated successfully');
            });
        }
    });
}

// Handle messages from popup or content scripts
chrome.runtime.onMessage.addListener(function handleRuntimeMessage(request, sender, sendResponse) {
    if (request.action === 'getStorageData') {
        chrome.storage.local.get(request.key, function handleGetStorageData(data) {
            sendResponse(data);
        });
        return true; // Will respond asynchronously
    }
    
    if (request.action === 'setStorageData') {
        chrome.storage.local.set(request.data, function handleSetStorageData() {
            sendResponse({ success: true });
        });
        return true;
    }
    
    if (request.action === 'collectDataFromPage') {
        // Handle data collection request from content script
        if (sender.tab) {
            // Execute data collection script in the tab
            chrome.scripting.executeScript({
                target: { tabId: sender.tab.id },
                files: ['assets/scripts/data-collector.js']
            }, function handleScriptInjection(injectionResults) {
                if (chrome.runtime.lastError) {
                    sendResponse({ success: false, error: chrome.runtime.lastError.message });
                    return;
                }
                
                // After injecting data collector, send message to actually collect data
                chrome.tabs.sendMessage(sender.tab.id, {
                    action: 'executeDataCollection'
                }, function handleDataCollectionResponse(response) {
                    if (response && response.success) {
                        // Send data to server
                        sendDataToServer(response.data.cases, function(serverResponse) {
                            sendResponse(serverResponse);
                        });
                    } else {
                        sendResponse({ success: false, error: response?.error || 'Failed to collect data' });
                    }
                });
            });
        } else {
            sendResponse({ success: false, error: 'No active tab' });
        }
        return true; // Keep message channel open for async response
    }
    
    if (request.action === 'collectData') {
        // Handle data collection request from sidebar
        console.log('Handling collectData request from sidebar');

        // Validate sender has a tab
        if (!sender || !sender.tab) {
            console.error('No active tab for data collection');
            sendResponse({ success: false, error: 'No active tab available for data collection' });
            return true;
        }

        try {
            // First ensure data collector is injected
            chrome.scripting.executeScript({
                target: { tabId: sender.tab.id },
                files: ['assets/scripts/data-collector.js']
            }, function handleDataCollectorInjection(injectionResults) {
                // Check for injection errors
                if (chrome.runtime.lastError) {
                    console.error('Error injecting data collector script:', chrome.runtime.lastError);
                    sendResponse({ success: false, error: 'Failed to inject data collector: ' + chrome.runtime.lastError.message });
                    return;
                }

                console.log('Data collector script injected, now injecting logger...');

                // Also inject logger if not already present
                chrome.scripting.executeScript({
                    target: { tabId: sender.tab.id },
                    files: ['assets/scripts/logger.js']
                }, function handleLoggerInjection(loggerResults) {
                    if (chrome.runtime.lastError) {
                        console.warn('Logger injection failed, continuing without logger:', chrome.runtime.lastError.message);
                    }

                    console.log('Sending executeDataCollection message to content script');
                    // After injecting scripts, send message to actually collect data
                    chrome.tabs.sendMessage(sender.tab.id, {
                        action: 'executeDataCollection'
                    }, function handleDataCollectionResponse(response) {
                        // Check for message errors
                        if (chrome.runtime.lastError) {
                            console.error('Error sending message to content script:', chrome.runtime.lastError);
                            sendResponse({ success: false, error: 'Failed to communicate with content script: ' + chrome.runtime.lastError.message });
                            return;
                        }

                        console.log('Received response from data collection:', response);
                        if (response && response.success) {
                            // Send data to server
                            console.log('Sending collected data to server, cases:', response.data.cases.length);
                            sendDataToServer(response.data.cases, function(serverResponse) {
                                console.log('Server response:', serverResponse);
                                sendResponse(serverResponse);
                            });
                        } else {
                            const errorMessage = response?.error || 'Failed to collect data from page';
                            console.error('Data collection failed:', errorMessage);
                            sendResponse({ success: false, error: errorMessage });
                        }
                    });
                });
            });
        } catch (error) {
            console.error('Error during data collection process:', error);
            sendResponse({ success: false, error: 'Error during data collection: ' + error.message });
        }
        return true; // Keep message channel open for async response
    }
    
    if (request.action === 'executeDataCollection') {
        // This message is sent to the content script to actually execute data collection
        // The content script will respond with the collected data
        // This is handled in the content script
        return false;
    }
    
    if (request.action === 'sendDataToServer') {
        // Handle sending data to server
        sendDataToServer(request.data, function(response) {
            sendResponse(response);
        });
        return true; // Keep message channel open for async response
    }
    
    if (request.action === 'retrieveData') {
        // Handle data retrieval request
        retrieveDataFromServer(request.apiKey, request.serverUrl, function(response) {
            sendResponse(response);
        });
        return true; // Keep message channel open for async response
    }
    
    if (request.action === 'getSettings') {
        // Get stored settings
        chrome.storage.local.get(['apiKey', 'serverUrl'], function handleGetSettings(result) {
            sendResponse({ 
                success: true, 
                settings: {
                    apiKey: result.apiKey || '',
                    serverUrl: result.serverUrl || 'http://localhost:3000'
                }
            });
        });
        return true; // Keep message channel open for async response
    } else if (request.action === 'saveSettings') {
        // Save settings
        chrome.storage.local.set({
            apiKey: request.settings.apiKey,
            serverUrl: request.settings.serverUrl
        }, function handleSaveSettings() {
            sendResponse({ success: true, message: 'Settings saved' });
        });
        return true; // Keep message channel open for async response
    }
});

// Send data to server
function sendDataToServer(data, callback) {
    console.log('Sending data to server, data length:', data ? data.length : 0);
    chrome.storage.local.get(['apiKey', 'serverUrl'], function(result) {
        const apiKey = result.apiKey || '';
        const serverUrl = result.serverUrl || 'http://localhost:3000';
        
        console.log('Server settings:', { apiKey: apiKey ? '***' + apiKey.substring(apiKey.length - 4) : '', serverUrl });
        
        if (!apiKey) {
            console.error('API key not set');
            callback({ success: false, error: 'API key not set', error_code: 'API_KEY_MISSING' });
            return;
        }
        
        if (!Array.isArray(data) || data.length === 0) {
            console.error('No data to send');
            callback({ success: false, error: 'No data to send', error_code: 'NO_DATA' });
            return;
        }
        
        const startTime = Date.now();
        console.log(`Sending ${data.length} cases to ${serverUrl}/api/remote/process-data`);
        
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
            console.log('Server response status:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(result => {
            console.log('Server response data:', result);
            const stats = result.stats || result;
            callback({
                success: true,
                stats: {
                    processed: stats.processed || 0,
                    created: stats.created || 0,
                    updated: stats.updated || 0,
                    skipped: stats.skipped || 0
                },
                message: result.message || `Обработано: ${stats.processed || 0} записей`
            });
        })
        .catch(error => {
            console.error('Error sending data to server:', error);
            let errorMessage = 'Failed to send data to server';
            let errorCode = 'SERVER_ERROR';
            
            if (error.message.includes('401')) {
                errorMessage = 'Invalid API key';
                errorCode = 'INVALID_API_KEY';
            } else if (error.message.includes('500')) {
                errorMessage = 'Server error';
                errorCode = 'SERVER_INTERNAL_ERROR';
            } else if (error.message.includes('Failed to fetch')) {
                errorMessage = 'Cannot connect to server';
                errorCode = 'CONNECTION_FAILED';
            }
            
            callback({ success: false, error: errorMessage, code: errorCode });
        });
    });
}

// Retrieve data from server
function retrieveDataFromServer(apiKey, serverUrl, callback) {
    console.log('Retrieving data from server with API key:', apiKey ? '***' + apiKey.substring(apiKey.length - 4) : '');
    const startTime = Date.now();
    
    // Make API call to retrieve today's data
    fetch(`${serverUrl}/api/remote/today-data`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey
        }
    })
    .then(response => {
        console.log('Server response status for data retrieval:', response.status);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Data retrieval successful, received data:', data);
        // Ensure proper data structure
        const responseData = data.data || data;
        callback({
            success: true,
            data: {
                createdToday: responseData.createdToday || { count: 0, cases: [] },
                updatedToday: responseData.updatedToday || { count: 0, cases: [] },
                summary: responseData.summary || {
                    date: new Date().toISOString().split('T')[0],
                    totalCreated: responseData.createdToday?.count || 0,
                    totalUpdated: responseData.updatedToday?.count || 0
                }
            }
        });
    })
    .catch(error => {
        console.error('Error retrieving data from server:', error);
        let errorMessage = 'Failed to retrieve data from server';
        let errorCode = 'RETRIEVE_ERROR';
        
        if (error.message.includes('401')) {
            errorMessage = 'Invalid API key';
            errorCode = 'INVALID_API_KEY';
        } else if (error.message.includes('500')) {
            errorMessage = 'Server error';
            errorCode = 'SERVER_INTERNAL_ERROR';
        } else if (error.message.includes('Failed to fetch')) {
            errorMessage = 'Cannot connect to server';
            errorCode = 'CONNECTION_FAILED';
        }
        
        callback({ success: false, error: errorMessage, code: errorCode });
    });
}