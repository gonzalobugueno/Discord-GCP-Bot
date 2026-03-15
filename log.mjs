
class SimpleLogger {
    constructor() {
        this.levels = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };
        this.currentLevel = this.levels[process.env.LOG_LEVEL?.toUpperCase()] ?? this.levels.INFO;
    }

    // Internal method to format and output the log
    _log(level, message, ...args) {
        if (this.levels[level] < this.currentLevel) return;

        const timestamp = new Date().toISOString();
        const formattedMessage = `[${timestamp}] [${level}] ${message}`;

        console.log(formattedMessage, ...args);
    }

    // Public methods for different log levels
    debug(message, ...args) { this._log('DEBUG', message, ...args); }
    info(message, ...args) { this._log('INFO', message, ...args); }
    warn(message, ...args) { this._log('WARN', message, ...args); }
    error(message, ...args) { this._log('ERROR', message, ...args); }
}

export const logger = new SimpleLogger();