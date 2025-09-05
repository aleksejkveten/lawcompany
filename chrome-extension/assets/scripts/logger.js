// Local logging system for Court Data Collector Chrome Extension
// This module provides comprehensive logging capabilities with local storage

// Prevent multiple declarations
if (typeof window.ExtensionLogger === 'undefined') {

class ExtensionLogger {
    constructor(maxLogs = 1000, storageKey = 'court_data_collector_logs') {
        this.maxLogs = maxLogs;
        this.storageKey = storageKey;
        this.logQueue = [];
        this.isInitialized = false;
        
        // Initialize logger
        this.init();
    }
    
    async init() {
        try {
            // Load existing logs from storage
            await this.loadLogs();
            this.isInitialized = true;
            console.log('Extension Logger initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Extension Logger:', error);
        }
    }
    
    // Log levels
    static get LEVELS() {
        return {
            ERROR: 'ERROR',
            WARN: 'WARN',
            INFO: 'INFO',
            DEBUG: 'DEBUG',
            TRACE: 'TRACE'
        };
    }
    
    // Main logging method
    async log(level, message, context = {}, category = 'general') {
        const logEntry = {
            id: this.generateLogId(),
            timestamp: new Date().toISOString(),
            level: level,
            message: message,
            context: context,
            category: category,
            url: typeof window !== 'undefined' ? window.location.href : 'background',
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
        };
        
        // Add to queue
        this.logQueue.push(logEntry);
        
        // Console output with color coding
        this.consoleOutput(logEntry);
        
        // Save to storage (debounced)
        this.debouncedSave();
        
        return logEntry.id;
    }
    
    // Convenience methods for different log levels
    async error(message, context = {}, category = 'general') {
        return this.log(ExtensionLogger.LEVELS.ERROR, message, context, category);
    }
    
    async warn(message, context = {}, category = 'general') {
        return this.log(ExtensionLogger.LEVELS.WARN, message, context, category);
    }
    
    async info(message, context = {}, category = 'general') {
        return this.log(ExtensionLogger.LEVELS.INFO, message, context, category);
    }
    
    async debug(message, context = {}, category = 'general') {
        return this.log(ExtensionLogger.LEVELS.DEBUG, message, context, category);
    }
    
    async trace(message, context = {}, category = 'general') {
        return this.log(ExtensionLogger.LEVELS.TRACE, message, context, category);
    }
    
    // Specialized logging methods for different operations
    async logDataCollection(operation, result, details = {}) {
        return this.info(`Data Collection: ${operation}`, {
            result: result,
            ...details
        }, 'data_collection');
    }
    
    async logApiCall(method, url, status, responseTime, details = {}) {
        const level = status >= 400 ? ExtensionLogger.LEVELS.ERROR : ExtensionLogger.LEVELS.INFO;
        return this.log(level, `API Call: ${method} ${url}`, {
            status: status,
            responseTime: responseTime,
            ...details
        }, 'api');
    }
    
    async logUserAction(action, details = {}) {
        return this.info(`User Action: ${action}`, details, 'user_action');
    }
    
    async logExtensionEvent(event, details = {}) {
        return this.info(`Extension Event: ${event}`, details, 'extension');
    }
    
    async logPageNavigation(fromUrl, toUrl, details = {}) {
        return this.info('Page Navigation', {
            from: fromUrl,
            to: toUrl,
            ...details
        }, 'navigation');
    }
    
    // Console output with color coding
    consoleOutput(logEntry) {
        const colors = {
            ERROR: '#ff4444',
            WARN: '#ff8800',
            INFO: '#0088ff',
            DEBUG: '#888888',
            TRACE: '#cccccc'
        };
        
        const color = colors[logEntry.level] || '#000000';
        const timestamp = new Date(logEntry.timestamp).toLocaleTimeString();
        
        const style = `color: ${color}; font-weight: bold;`;
        
        console.log(
            `%c[${logEntry.level}] ${timestamp} [${logEntry.category}]`,
            style,
            logEntry.message,
            logEntry.context
        );
    }
    
    // Generate unique log ID
    generateLogId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }
    
    // Load logs from Chrome storage
    async loadLogs() {
        return new Promise((resolve, reject) => {
            if (typeof chrome !== 'undefined' && chrome.storage) {
                chrome.storage.local.get([this.storageKey], (result) => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                        return;
                    }
                    
                    this.logQueue = result[this.storageKey] || [];
                    resolve(this.logQueue);
                });
            } else {
                // Fallback to localStorage
                try {
                    const stored = localStorage.getItem(this.storageKey);
                    this.logQueue = stored ? JSON.parse(stored) : [];
                    resolve(this.logQueue);
                } catch (error) {
                    reject(error);
                }
            }
        });
    }
    
    // Save logs to storage
    async saveLogs() {
        // Trim logs if exceeding max limit
        if (this.logQueue.length > this.maxLogs) {
            this.logQueue = this.logQueue.slice(-this.maxLogs);
        }
        
        return new Promise((resolve, reject) => {
            if (typeof chrome !== 'undefined' && chrome.storage) {
                chrome.storage.local.set({
                    [this.storageKey]: this.logQueue
                }, () => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                        return;
                    }
                    resolve();
                });
            } else {
                // Fallback to localStorage
                try {
                    localStorage.setItem(this.storageKey, JSON.stringify(this.logQueue));
                    resolve();
                } catch (error) {
                    reject(error);
                }
            }
        });
    }
    
    // Debounced save to prevent too frequent storage writes
    debouncedSave() {
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
        }
        
        this.saveTimeout = setTimeout(() => {
            this.saveLogs().catch(error => {
                console.error('Failed to save logs:', error);
            });
        }, 1000);
    }
    
    // Get logs with filtering options
    async getLogs(options = {}) {
        const {
            level = null,
            category = null,
            startTime = null,
            endTime = null,
            limit = 100,
            search = null
        } = options;
        
        let filteredLogs = [...this.logQueue];
        
        // Filter by level
        if (level) {
            filteredLogs = filteredLogs.filter(log => log.level === level);
        }
        
        // Filter by category
        if (category) {
            filteredLogs = filteredLogs.filter(log => log.category === category);
        }
        
        // Filter by time range
        if (startTime) {
            filteredLogs = filteredLogs.filter(log => 
                new Date(log.timestamp) >= new Date(startTime)
            );
        }
        
        if (endTime) {
            filteredLogs = filteredLogs.filter(log => 
                new Date(log.timestamp) <= new Date(endTime)
            );
        }
        
        // Search in message and context
        if (search) {
            const searchLower = search.toLowerCase();
            filteredLogs = filteredLogs.filter(log => 
                log.message.toLowerCase().includes(searchLower) ||
                JSON.stringify(log.context).toLowerCase().includes(searchLower)
            );
        }
        
        // Sort by timestamp (newest first)
        filteredLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        // Apply limit
        return filteredLogs.slice(0, limit);
    }
    
    // Get log statistics
    async getStats() {
        const stats = {
            total: this.logQueue.length,
            byLevel: {},
            byCategory: {},
            oldest: null,
            newest: null
        };
        
        // Count by level and category
        this.logQueue.forEach(log => {
            stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;
            stats.byCategory[log.category] = (stats.byCategory[log.category] || 0) + 1;
        });
        
        // Find oldest and newest
        if (this.logQueue.length > 0) {
            const timestamps = this.logQueue.map(log => new Date(log.timestamp));
            stats.oldest = new Date(Math.min(...timestamps)).toISOString();
            stats.newest = new Date(Math.max(...timestamps)).toISOString();
        }
        
        return stats;
    }
    
    // Clear all logs
    async clearLogs() {
        this.logQueue = [];
        await this.saveLogs();
        console.log('All logs cleared');
    }
    
    // Export logs
    async exportLogs(format = 'json') {
        const logs = await this.getLogs({ limit: this.maxLogs });
        
        if (format === 'json') {
            return JSON.stringify(logs, null, 2);
        } else if (format === 'csv') {
            return this.logsToCSV(logs);
        } else if (format === 'txt') {
            return this.logsToText(logs);
        }
        
        throw new Error(`Unsupported export format: ${format}`);
    }
    
    // Convert logs to CSV format
    logsToCSV(logs) {
        const header = 'Timestamp,Level,Category,Message,Context,URL\n';
        const rows = logs.map(log => {
            const context = JSON.stringify(log.context).replace(/"/g, '""');
            return `"${log.timestamp}","${log.level}","${log.category}","${log.message}","${context}","${log.url}"`;
        });
        
        return header + rows.join('\n');
    }
    
    // Convert logs to text format
    logsToText(logs) {
        return logs.map(log => {
            const timestamp = new Date(log.timestamp).toLocaleString();
            const context = Object.keys(log.context).length > 0 ? 
                `\n  Context: ${JSON.stringify(log.context, null, 2)}` : '';
            
            return `[${log.level}] ${timestamp} [${log.category}] ${log.message}${context}`;
        }).join('\n\n');
    }
}

// Create global logger instance
window.ExtensionLogger = window.ExtensionLogger || new ExtensionLogger();

} // End of ExtensionLogger check

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ExtensionLogger;
}