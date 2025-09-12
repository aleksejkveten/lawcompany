// Content script for Chrome extension - Right sidebar injection

// Global variables - Fixed declaration with safety check
if (typeof sidebarInjected === 'undefined') {
    var sidebarInjected = false;
}
if (typeof sidebarContainer === 'undefined') {
    var sidebarContainer = null;
}
if (typeof sidebarVisible === 'undefined') {
    var sidebarVisible = false;
}

// Prevent multiple initialization with a global flag
if (window.courtDataCollectorInitialized) {
    // But still listen for messages
    if (!window.courtDataCollectorMessageListener) {
        chrome.runtime.onMessage.addListener(function handleExtensionMessage(request, sender, sendResponse) {
            if (request.action === 'toggleSidebar') {
                toggleSidebar();
                sendResponse({ success: true, visible: sidebarVisible });
            } else if (request.action === 'collectData') {
                // Send message to background script for data collection
                chrome.runtime.sendMessage({action: 'collectDataFromPage'}, function(response) {
                    sendResponse(response);
                });
                return true; // Keep message channel open
            } else if (request.action === 'ping') {
                sendResponse({ success: true, message: 'pong' });
            }
        });
        window.courtDataCollectorMessageListener = true;
    }
} else {
    window.courtDataCollectorInitialized = true;
    
    try {
        // Initialize extension when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeExtension);
        } else {
            initializeExtension();
        }
    } catch (error) {
        // Silent error handling to prevent blocking
        window.contentScriptError = error.message;
        window.contentScriptExecuted = false;
    }
    
    // Set execution marker
    window.contentScriptExecuted = true;
}

function initializeExtension() {
    // Listen for extension icon click
    chrome.runtime.onMessage.addListener(function handleExtensionMessage(request, sender, sendResponse) {
        if (request.action === 'toggleSidebar') {
            toggleSidebar();
            sendResponse({ success: true, visible: sidebarVisible });
        } else if (request.action === 'collectData') {
            // Send message to background script for data collection
            chrome.runtime.sendMessage({action: 'collectDataFromPage'}, function(response) {
                sendResponse(response);
            });
            return true; // Keep message channel open
        } else if (request.action === 'ping') {
            sendResponse({ success: true, message: 'pong' });
        }
    });
    
    // Inject sidebar on first load (hidden)
    injectSidebar();
}

function injectSidebar() {
    if (sidebarInjected) {
        return;
    }
    
    // Create sidebar container
    sidebarContainer = document.createElement('div');
    sidebarContainer.id = 'court-data-collector-sidebar';
    sidebarContainer.className = 'cdc-sidebar-container';
    
    // Load sidebar HTML
    const sidebarURL = chrome.runtime.getURL('sidebar.html');
    
    fetch(sidebarURL)
        .then(function handleSidebarHTMLResponse(response) { 
            return response.text(); 
        })
        .then(function handleSidebarHTMLContent(html) {
            // Remove the CSS and JS links from the HTML since we'll load them separately
            html = html.replace(/<link[^>]*href="assets\/styles\/sidebar\.css"[^>]*>/g, '');
            html = html.replace(/<script[^>]*src="assets\/scripts\/sidebar\.js"[^>]*><\/script>/g, '');
            
            sidebarContainer.innerHTML = html;
            
            // Inject sidebar CSS
            const sidebarCSSURL = chrome.runtime.getURL('assets/styles/sidebar.css');
            const cssLink = document.createElement('link');
            cssLink.rel = 'stylesheet';
            cssLink.href = sidebarCSSURL;
            document.head.appendChild(cssLink);
            
            // Adjust body layout to accommodate sidebar
            adjustPageLayout();
            
            // Append sidebar to body
            document.body.appendChild(sidebarContainer);
            
            // Initialize sidebar functionality with proper script loading sequence
            initializeSidebarEvents();
            
            sidebarInjected = true;
        })
        .catch(function handleSidebarLoadError(error) {
            // Silent error handling to prevent blocking
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

async function initializeSidebarEvents() {
    const closeSidebarBtn = sidebarContainer.querySelector('#closeSidebar');
    if (closeSidebarBtn) {
        closeSidebarBtn.addEventListener('click', toggleSidebar);
    }
    
    // Load scripts in sequence using await for proper ordering
    try {
        // Load logger script first
        await loadLoggerScript();
        
        // Load data collector script
        await loadDataCollectorScript();
        
        // Load sidebar script last
        await loadSidebarScript();
        
        // Add a small delay to ensure DOM is ready
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Initialize sidebar functionality
        initializeSidebarFunctionality();
    } catch (error) {
        // Even if there's an error, try to initialize functionality
        initializeSidebarFunctionality();
    }
}

function loadLoggerScript() {
    return new Promise((resolve, reject) => {
        // Check if already loaded with more robust checking
        if (window.ExtensionLogger && window.ExtensionLogger.isInitialized) {
            resolve();
            return;
        }
        
        // Create script element
        const script = document.createElement('script');
        script.src = chrome.runtime.getURL('assets/scripts/logger.js');
        script.id = 'court-data-collector-logger-script';
        
        script.onload = () => {
            // Wait for execution with polling
            let attempts = 0;
            const maxAttempts = 50;
            
            function checkLogger() {
                attempts++;
                if (window.ExtensionLogger && window.ExtensionLogger.isInitialized) {
                    resolve();
                } else if (attempts < maxAttempts) {
                    setTimeout(checkLogger, 100);
                } else {
                    // Even if logger fails, we continue with the initialization
                    resolve();
                }
            }
            
            checkLogger();
        };
        
        script.onerror = (error) => {
            // Even if logger fails, we continue with the initialization
            resolve();
        };
        
        document.head.appendChild(script);
    });
}

function loadDataCollectorScript() {
    return new Promise((resolve, reject) => {
        // Check if already loaded with more robust checking
        if (window.CourtDataCollector) {
            resolve();
            return;
        }
        
        // Create script element
        const script = document.createElement('script');
        script.src = chrome.runtime.getURL('assets/scripts/data-collector.js');
        script.id = 'court-data-collector-data-script';
        
        script.onload = () => {
            // Wait for execution with polling
            let attempts = 0;
            const maxAttempts = 50;
            
            function checkDataCollector() {
                attempts++;
                if (window.CourtDataCollector) {
                    resolve();
                } else if (attempts < maxAttempts) {
                    setTimeout(checkDataCollector, 100);
                } else {
                    // Even if data collector fails, we continue with the initialization
                    resolve();
                }
            }
            
            checkDataCollector();
        };
        
        script.onerror = (error) => {
            // Even if data collector fails, we continue with the initialization
            resolve();
        };
        
        document.head.appendChild(script);
    });
}

function loadSidebarScript() {
    return new Promise((resolve, reject) => {
        // Check if already loaded with more robust checking
        if (window.CourtDataCollectorSidebar && typeof window.CourtDataCollectorSidebar.init === 'function') {
            resolve();
            return;
        }
        
        // Reset any sidebar script flags to allow fresh execution
        delete window.sidebarScriptLoaded;
        delete window.sidebarScriptExecuted;
        delete window.sidebarScriptSkipped;
        delete window.CourtDataCollectorSidebar;
        delete window.sidebarScriptProperlyInitialized;
        delete window.sidebarScriptProcessingComplete;
        
        // Create script element
        const script = document.createElement('script');
        script.src = chrome.runtime.getURL('assets/scripts/sidebar.js');
        script.id = 'court-data-collector-sidebar-script';
        
        script.onload = () => {
            // Wait for execution with polling
            let attempts = 0;
            const maxAttempts = 50;
            
            function checkSidebar() {
                attempts++;
                if (window.CourtDataCollectorSidebar && typeof window.CourtDataCollectorSidebar.init === 'function') {
                    resolve();
                } else if (attempts < maxAttempts) {
                    setTimeout(checkSidebar, 100);
                } else {
                    // Even if sidebar fails, we continue with the initialization
                    resolve();
                }
            }
            
            checkSidebar();
        };
        
        script.onerror = (error) => {
            // Even if sidebar fails, we continue with the initialization
            resolve();
        };
        
        document.head.appendChild(script);
    });
}

function initializeSidebarFunctionality() {
    // Try multiple times with delays to ensure sidebar is ready
    let attempts = 0;
    const maxAttempts = 20;
    
    function tryInitialize() {
        attempts++;
        
        // Check if sidebar object exists and has required methods
        if (window.CourtDataCollectorSidebar && typeof window.CourtDataCollectorSidebar.init === 'function') {
            try {
                // Call init method
                window.CourtDataCollectorSidebar.init();
                
                // Set up debug functions
                setupDebugFunctions();
                
                // Set success indicator
                window.sidebarInitialized = true;
                return true;
            } catch (error) {
                // Silent error handling
                window.sidebarInitError = error.message;
                // Continue trying
                if (attempts < maxAttempts) {
                    setTimeout(tryInitialize, 150);
                } else {
                    window.sidebarInitFailed = true;
                    return false;
                }
            }
        } else {
            if (attempts < maxAttempts) {
                setTimeout(tryInitialize, 150);
            } else {
                window.sidebarInitFailed = true;
                return false;
            }
        }
    }
    
    // Start the initialization attempts
    tryInitialize();
}

function setupDebugFunctions() {
    window.testSidebar = {
        checkElements: function() {
            return window.CourtDataCollectorSidebar.debug ? 
                window.CourtDataCollectorSidebar.debug.checkElements() : 
                'Debug object not available';
        },
        switchTab: function(tabName) {
            return window.CourtDataCollectorSidebar.debug ? 
                window.CourtDataCollectorSidebar.debug.testTabSwitch(tabName) : 
                window.CourtDataCollectorSidebar.switchTab(tabName);
        },
        getCurrentTab: function() {
            return window.CourtDataCollectorSidebar.debug ? 
                window.CourtDataCollectorSidebar.debug.getCurrentTab() : 
                'Debug not available';
        },
        toggleConfig: function() {
            const toggle = document.getElementById('config-toggle');
            if (toggle) {
                toggle.click();
            }
        },
        debugInfo: function() {
            return {
                sidebarInitialized: window.sidebarInitialized,
                sidebarInitError: window.sidebarInitError,
                sidebarInitFailed: window.sidebarInitFailed,
                contentScriptExecuted: window.contentScriptExecuted,
                courtDataCollectorInitialized: window.courtDataCollectorInitialized,
                sidebarScriptExecuted: window.sidebarScriptExecuted,
                hasCourtDataCollectorSidebar: !!window.CourtDataCollectorSidebar,
                sidebarMethods: window.CourtDataCollectorSidebar ? Object.keys(window.CourtDataCollectorSidebar) : []
            };
        }
    };
}

// Handle keyboard shortcuts
document.addEventListener('keydown', function handleKeyboardShortcuts(event) {
    // Ctrl+Shift+C to toggle sidebar
    if (event.ctrlKey && event.shiftKey && event.code === 'KeyC') {
        event.preventDefault();
        toggleSidebar();
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