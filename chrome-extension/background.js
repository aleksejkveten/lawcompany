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
chrome.runtime.onInstalled.addListener(function handleExtensionInstall() {
    // Initialize storage with default values
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
});

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
                    sendResponse(response);
                });
            });
        } else {
            sendResponse({ success: false, error: 'No active tab' });
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
    chrome.storage.local.get(['apiKey', 'serverUrl'], function(result) {
        const apiKey = result.apiKey || '';
        const serverUrl = result.serverUrl || 'http://localhost:3000';
        
        if (!apiKey) {
            callback({ success: false, error: 'API key not set' });
            return;
        }
        
        if (!Array.isArray(data) || data.length === 0) {
            callback({ success: false, error: 'No data to send' });
            return;
        }
        
        const startTime = Date.now();
        
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
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(result => {
            callback({ success: true, stats: result.stats });
        })
        .catch(error => {
            let errorMessage = 'Failed to send data to server';
            if (error.message.includes('401')) {
                errorMessage = 'Invalid API key';
            } else if (error.message.includes('500')) {
                errorMessage = 'Server error';
            } else if (error.message.includes('Failed to fetch')) {
                errorMessage = 'Cannot connect to server';
            }
            
            callback({ success: false, error: errorMessage });
        });
    });
}

// Retrieve data from server
function retrieveDataFromServer(apiKey, serverUrl, callback) {
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
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        callback({ success: true, data: data.data });
    })
    .catch(error => {
        let errorMessage = 'Failed to retrieve data from server';
        if (error.message.includes('401')) {
            errorMessage = 'Invalid API key';
        } else if (error.message.includes('500')) {
            errorMessage = 'Server error';
        } else if (error.message.includes('Failed to fetch')) {
            errorMessage = 'Cannot connect to server';
        }
        
        callback({ success: false, error: errorMessage });
    });
}

// Example: Listen for tab updates for potential data collection
chrome.tabs.onUpdated.addListener(function handleTabUpdate(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete') {
        // Could trigger data collection here if enabled
    }
});