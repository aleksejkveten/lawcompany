// Logger script for Court Data Collector Extension
// Provides logging functionality with multiple levels and storage

(function() {
    // Prevent duplicate script execution
    if (window.ExtensionLogger) {
        return;
    }

    // Logger levels
    const LOG_LEVELS = {
        ERROR: 0,
        WARN: 1,
        INFO: 2,
        DEBUG: 3
    };

    // Current log level (can be adjusted)
    let currentLogLevel = LOG_LEVELS.DEBUG;

    // In-memory log storage
    let logs = [];

    // Maximum number of logs to keep in memory
    const MAX_LOGS = 1000;

    // Logger class
    class ExtensionLogger {
        /**
         * Log a message at ERROR level
         * @param {string} message - The message to log
         * @param {Object} context - Additional context data
         * @param {string} category - Category of the log
         */
        static error(message, context = {}, category = 'general') {
            this.log(LOG_LEVELS.ERROR, 'ERROR', message, context, category);
        }

        /**
         * Log a message at WARN level
         * @param {string} message - The message to log
         * @param {Object} context - Additional context data
         * @param {string} category - Category of the log
         */
        static warn(message, context = {}, category = 'general') {
            this.log(LOG_LEVELS.WARN, 'WARN', message, context, category);
        }

        /**
         * Log a message at INFO level
         * @param {string} message - The message to log
         * @param {Object} context - Additional context data
         * @param {string} category - Category of the log
         */
        static info(message, context = {}, category = 'general') {
            this.log(LOG_LEVELS.INFO, 'INFO', message, context, category);
        }

        /**
         * Log a message at DEBUG level
         * @param {string} message - The message to log
         * @param {Object} context - Additional context data
         * @param {string} category - Category of the log
         */
        static debug(message, context = {}, category = 'general') {
            this.log(LOG_LEVELS.DEBUG, 'DEBUG', message, context, category);
        }

        /**
         * Internal log function
         * @param {number} level - Log level number
         * @param {string} levelName - Log level name
         * @param {string} message - The message to log
         * @param {Object} context - Additional context data
         * @param {string} category - Category of the log
         */
        static log(level, levelName, message, context, category) {
            // Check if we should log this based on current log level
            if (level > currentLogLevel) {
                return;
            }

            // Create log entry
            const logEntry = {
                timestamp: new Date().toISOString(),
                level: levelName,
                message: message,
                context: context,
                category: category
            };

            // Add to logs array
            logs.push(logEntry);

            // Trim logs if we exceed maximum
            if (logs.length > MAX_LOGS) {
                logs = logs.slice(-MAX_LOGS);
            }

            // Also log to console for debugging with human-readable format
            const timestamp = new Date().toLocaleString('ru-RU');
            const consoleMessage = `${message}`;
            const contextStr = context && Object.keys(context).length > 0 ?
                JSON.stringify(context, null, 2) : '';

            switch (level) {
                case LOG_LEVELS.ERROR:
                    console.error(consoleMessage);
                    if (contextStr) console.error(contextStr);
                    console.error(`${timestamp} [${levelName}]`);
                    break;
                case LOG_LEVELS.WARN:
                    console.warn(consoleMessage);
                    if (contextStr) console.warn(contextStr);
                    console.warn(`${timestamp} [${levelName}]`);
                    break;
                case LOG_LEVELS.INFO:
                    console.info(consoleMessage);
                    if (contextStr) console.info(contextStr);
                    console.info(`${timestamp} [${levelName}]`);
                    break;
                case LOG_LEVELS.DEBUG:
                    console.debug(consoleMessage);
                    if (contextStr) console.debug(contextStr);
                    console.debug(`${timestamp} [${levelName}]`);
                    break;
            }
        }

        /**
         * Get logs with optional filtering
         * @param {Object} options - Filter options
         * @param {number} options.limit - Maximum number of logs to return
         * @param {string} options.level - Filter by log level
         * @param {string} options.category - Filter by category
         * @param {string} options.search - Search in message
         * @returns {Array} Array of log entries
         */
        static async getLogs(options = {}) {
            let filteredLogs = [...logs];

            // Apply filters
            if (options.level) {
                filteredLogs = filteredLogs.filter(log => log.level === options.level);
            }

            if (options.category) {
                filteredLogs = filteredLogs.filter(log => log.category === options.category);
            }

            if (options.search) {
                const searchTerm = options.search.toLowerCase();
                filteredLogs = filteredLogs.filter(log => 
                    log.message.toLowerCase().includes(searchTerm) ||
                    log.category.toLowerCase().includes(searchTerm)
                );
            }

            // Sort by timestamp (newest first)
            filteredLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            // Apply limit
            if (options.limit) {
                filteredLogs = filteredLogs.slice(0, options.limit);
            }

            return filteredLogs;
        }

        /**
         * Get log statistics
         * @returns {Object} Statistics object
         */
        static async getStats() {
            const stats = {
                total: logs.length,
                byLevel: {},
                byCategory: {}
            };

            // Count by level
            logs.forEach(log => {
                stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;
            });

            // Count by category
            logs.forEach(log => {
                stats.byCategory[log.category] = (stats.byCategory[log.category] || 0) + 1;
            });

            return stats;
        }

        /**
         * Clear all logs
         */
        static async clearLogs() {
            logs = [];
        }

        /**
         * Export logs in specified format
         * @param {string} format - Export format (json, text)
         * @returns {string} Exported data
         */
        static async exportLogs(format = 'json') {
            if (format === 'json') {
                return JSON.stringify(logs, null, 2);
            } else if (format === 'text') {
                return logs.map(log => 
                    `[${log.timestamp}] ${log.level} [${log.category}] ${log.message} ${JSON.stringify(log.context)}`
                ).join('\n');
            } else {
                throw new Error(`Unsupported export format: ${format}`);
            }
        }

        /**
         * Set current log level
         * @param {string} level - Log level name
         */
        static setLogLevel(level) {
            if (LOG_LEVELS.hasOwnProperty(level)) {
                currentLogLevel = LOG_LEVELS[level];
            }
        }
    }

    // Assign to window
    window.ExtensionLogger = ExtensionLogger;
    
    // Mark as initialized
    window.ExtensionLogger.isInitialized = true;
})();