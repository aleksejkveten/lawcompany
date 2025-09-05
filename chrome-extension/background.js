// Background script for Chrome extension
console.log('Court Data Collector background script loaded');

// Handle extension icon click
chrome.action.onClicked.addListener(async (tab) => {
    console.log('Extension icon clicked for tab:', tab.id);
    
    // Check if tab URL is allowed
    if (!isValidTabUrl(tab.url)) {
        console.log('Cannot inject into this URL:', tab.url);
        return;
    }
    
    try {
        // Inject content script if not already injected
        await ensureContentScriptInjected(tab.id);
        
        // Send message to content script to toggle sidebar
        const response = await chrome.tabs.sendMessage(tab.id, {
            action: 'toggleSidebar'
        });
        
        console.log('Sidebar toggle response:', response);
    } catch (error) {
        console.error('Error toggling sidebar:', error);
        
        // If content script is not ready, inject it
        try {
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['content.js']
            });
            
            // Wait a moment for content script to initialize
            setTimeout(async () => {
                try {
                    await chrome.tabs.sendMessage(tab.id, {
                        action: 'toggleSidebar'
                    });
                } catch (retryError) {
                    console.error('Retry error:', retryError);
                }
            }, 500);
        } catch (injectionError) {
            console.error('Failed to inject content script:', injectionError);
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
    
    return !restrictedPatterns.some(pattern => url.startsWith(pattern));
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
chrome.runtime.onInstalled.addListener(function() {
    console.log('Extension installed');
    
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
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log('Background script received message:', request);
    
    if (request.action === 'getStorageData') {
        chrome.storage.local.get(request.key, function(data) {
            sendResponse(data);
        });
        return true; // Will respond asynchronously
    }
    
    if (request.action === 'setStorageData') {
        chrome.storage.local.set(request.data, function() {
            sendResponse({ success: true });
        });
        return true;
    }
    
    if (request.action === 'dataCollected') {
        // Handle collected data
        console.log('Data collected:', request.data);
        
        // Here you could store data or send to your API
        // For now, just acknowledge
        sendResponse({ success: true, message: 'Data received by background script' });
    } else if (request.action === 'collectData') {
        // Handle data collection request from sidebar
        if (sender.tab) {
            // Forward request to content script
            chrome.tabs.sendMessage(sender.tab.id, {
                action: 'collectData'
            }, (response) => {
                sendResponse(response);
            });
        } else {
            sendResponse({ success: false, error: 'No active tab' });
        }
        return true; // Keep message channel open for async response
    } else if (request.action === 'getSettings') {
        // Get stored settings
        chrome.storage.local.get(['apiKey', 'serverUrl'], (result) => {
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
        }, () => {
            sendResponse({ success: true, message: 'Settings saved' });
        });
        return true; // Keep message channel open for async response
    }
});

// Example: Listen for tab updates for potential data collection
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete') {
        console.log('Tab loaded:', tab.url);
        // Could trigger data collection here if enabled
    }
});