// Content script for Chrome extension - Simplified communication layer

// Global variables
var sidebarInjected = false;
var sidebarContainer = null;
var sidebarVisible = false;

// Prevent multiple initialization
if (window.courtDataCollectorInitialized) {
    // Already initialized, just listen for messages
    setupMessageListener();
} else {
    window.courtDataCollectorInitialized = true;
    setupMessageListener();
}

function setupMessageListener() {
    chrome.runtime.onMessage.addListener(function handleExtensionMessage(request, sender, sendResponse) {

        if (request.action === 'toggleSidebar') {
            // Initialize sidebar only when user activates the extension
            if (!sidebarInjected) {
                initializeSidebar();
            }
            toggleSidebar();
            sendResponse({ success: true, visible: sidebarVisible });
        } else if (request.action === 'executeDataCollection') {
            // Execute data collection - data collector should already be injected by background script
            try {
                if (window.CourtDataCollector && typeof window.CourtDataCollector.collectCourtData === 'function') {
                    const data = window.CourtDataCollector.collectCourtData();
                    sendResponse({ success: true, data: data });
                } else {
                    console.error('Data collector not available');
                    sendResponse({ success: false, error: 'Data collector not available' });
                }
            } catch (error) {
                console.error('Error during data collection:', error);
                sendResponse({ success: false, error: error.message });
            }
            return true; // Keep message channel open
        } else if (request.action === 'ping') {
            sendResponse({ success: true, message: 'pong' });
        }

        return true; // Indicate async response
    });
}

function initializeSidebar() {

    // Create sidebar container
    sidebarContainer = document.createElement('div');
    sidebarContainer.id = 'court-data-collector-sidebar';
    sidebarContainer.className = 'cdc-sidebar-container';

    // Load sidebar HTML
    const sidebarURL = chrome.runtime.getURL('sidebar.html');
    fetch(sidebarURL)
        .then(response => response.text())
        .then(html => {
            // Remove script and link tags - they'll be injected separately
            html = html.replace(/<link[^>]*href="assets\/styles\/sidebar\.css"[^>]*>/g, '');
            html = html.replace(/<script[^>]*src="assets\/scripts\/sidebar\.js"[^>]*><\/script>/g, '');

            sidebarContainer.innerHTML = html;

            // Inject CSS
            const cssLink = document.createElement('link');
            cssLink.rel = 'stylesheet';
            cssLink.href = chrome.runtime.getURL('assets/styles/sidebar.css');
            document.head.appendChild(cssLink);

            // Inject scripts in correct order
            injectSidebarScripts();

            // Adjust page layout
            adjustPageLayout();

            // Append to body
            document.body.appendChild(sidebarContainer);
            sidebarInjected = true;

            // Add close button event listener
            const closeBtn = sidebarContainer.querySelector('#closeSidebar');
            if (closeBtn) {
                closeBtn.addEventListener('click', toggleSidebar);
            }

        })
        .catch(error => {
            console.error('Failed to load sidebar HTML:', error);
        });
}

function injectSidebarScripts() {
    // Inject logger first
    const loggerScript = document.createElement('script');
    loggerScript.src = chrome.runtime.getURL('assets/scripts/logger.js');
    loggerScript.onload = function() {

        // Then inject data collector
        const dataCollectorScript = document.createElement('script');
        dataCollectorScript.src = chrome.runtime.getURL('assets/scripts/data-collector.js');
        dataCollectorScript.onload = function() {

            // Finally inject sidebar script
            const sidebarScript = document.createElement('script');
            sidebarScript.src = chrome.runtime.getURL('assets/scripts/sidebar.js');
            sidebarScript.onload = function() {
                // Initialize sidebar functionality after all scripts are loaded
                initializeSidebarWithRetry();
            };
            sidebarScript.onerror = function() {
                console.error('Failed to load sidebar script');
            };
            document.head.appendChild(sidebarScript);
        };
        dataCollectorScript.onerror = function() {
            console.error('Failed to load data collector script');
        };
        document.head.appendChild(dataCollectorScript);
    };
    loggerScript.onerror = function() {
        console.error('Failed to load logger script');
    };
    document.head.appendChild(loggerScript);
}

function initializeSidebarWithRetry(attempts = 0, maxAttempts = 10) {
    if (window.CourtDataCollectorSidebar && typeof window.CourtDataCollectorSidebar.init === 'function') {
        try {
            window.CourtDataCollectorSidebar.init();
        } catch (error) {
            console.error('Error initializing sidebar:', error);
        }
    } else if (attempts < maxAttempts) {
        // Wait a bit and try again
        setTimeout(() => {
            initializeSidebarWithRetry(attempts + 1, maxAttempts);
        }, 200);
    }
}



function adjustPageLayout() {
    // Prevent page content from being hidden behind sidebar
    const style = document.createElement('style');
    style.id = 'cdc-page-adjustment';
    style.textContent = `
        .cdc-sidebar-container {
            position: fixed !important;
            top: 0 !important;
            right: -420px !important;
            width: 420px !important;
            height: 100vh !important;
            z-index: 2147483647 !important;
            transition: right 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important;
            background: linear-gradient(to bottom, #ffffff 0%, #f9fafb 100%) !important;
            box-shadow: -8px 0 32px rgba(0, 0, 0, 0.12) !important;
            backdrop-filter: blur(20px) !important;
        }

        .cdc-sidebar-container.visible {
            right: 0 !important;
        }

        body.cdc-sidebar-open {
            margin-right: 420px !important;
            transition: margin-right 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important;
        }

        @media (max-width: 768px) {
            .cdc-sidebar-container {
                width: 100vw !important;
                right: -100vw !important;
            }

            body.cdc-sidebar-open {
                margin-right: 0 !important;
                overflow: hidden !important;
            }
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
        return;
    }

    sidebarVisible = !sidebarVisible;

    if (sidebarVisible) {
        sidebarContainer.classList.add('visible');
        document.body.classList.add('cdc-sidebar-open');
    } else {
        sidebarContainer.classList.remove('visible');
        document.body.classList.remove('cdc-sidebar-open');
    }
}


// Handle keyboard shortcuts
document.addEventListener('keydown', function handleKeyboardShortcuts(event) {
    // Ctrl+Shift+C to toggle sidebar
    if (event.ctrlKey && event.shiftKey && event.code === 'KeyC') {
        event.preventDefault();
        toggleSidebar();
    }
});


// Handle messages from sidebar
window.addEventListener('message', function handleSidebarMessage(event) {
    // Only accept messages from same origin
    if (event.source !== window) return;
    
    if (event.data.type === 'SIDEBAR_REQUEST') {
        const { messageId, action, data } = event.data;

        // Handle different actions
        if (action === 'collectData') {
            // Send message to background script
            chrome.runtime.sendMessage({ action: 'collectData' }, (response) => {
                // Send response back to sidebar
                window.postMessage({
                    type: 'SIDEBAR_RESPONSE',
                    messageId: messageId,
                    response: response || { success: false, error: 'No response from background' }
                }, '*');
            });
        } else if (action === 'retrieveData') {
            // Send message to background script
            chrome.runtime.sendMessage({
                action: 'retrieveData',
                apiKey: data.apiKey,
                serverUrl: data.serverUrl
            }, (response) => {
                // Send response back to sidebar
                window.postMessage({
                    type: 'SIDEBAR_RESPONSE',
                    messageId: messageId,
                    response: response || { success: false, error: 'No response from background' }
                }, '*');
            });
        } else if (action === 'getSettings') {
            // Get settings from chrome.storage
            chrome.storage.local.get(['apiKey', 'serverUrl'], (result) => {
                window.postMessage({
                    type: 'SIDEBAR_RESPONSE',
                    messageId: messageId,
                    response: {
                        success: true,
                        settings: {
                            apiKey: result.apiKey || '',
                            serverUrl: result.serverUrl || 'http://localhost:3000'
                        }
                    }
                }, '*');
            });
        } else if (action === 'saveSettings') {
            // Save settings to chrome.storage
            chrome.storage.local.set({
                apiKey: data.settings.apiKey,
                serverUrl: data.settings.serverUrl
            }, () => {
                window.postMessage({
                    type: 'SIDEBAR_RESPONSE',
                    messageId: messageId,
                    response: { success: true, message: 'Settings saved' }
                }, '*');
            });
        } else {
            // Unknown action
            window.postMessage({
                type: 'SIDEBAR_RESPONSE',
                messageId: messageId,
                response: { success: false, error: 'Unknown action: ' + action }
            }, '*');
        }
    }
});

// Clean up when page unloads
window.addEventListener('beforeunload', function cleanupOnUnload() {
    if (sidebarContainer && sidebarContainer.parentNode) {
        sidebarContainer.parentNode.removeChild(sidebarContainer);
    }
    
    const style = document.getElementById('cdc-page-adjustment');
    if (style && style.parentNode) {
        style.parentNode.removeChild(style);
    }
    
    document.body.classList.remove('cdc-sidebar-open');
});