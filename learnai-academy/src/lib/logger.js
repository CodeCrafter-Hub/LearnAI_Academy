import winston from 'winston';

/**
 * Logger Service
 *
 * Provides structured logging with different levels and transports
 * for development and production environments.
 */

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Add colors to winston
winston.addColors(colors);

// Define log format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Define JSON format for production
const jsonFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Define transports
const transports = [
  // Console transport for all environments
  new winston.transports.Console({
    format: process.env.NODE_ENV === 'production' ? jsonFormat : format,
  }),
];

// Add file transports in production
if (process.env.NODE_ENV === 'production') {
  transports.push(
    // Error logs
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: jsonFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Combined logs
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: jsonFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  levels,
  transports,
  exitOnError: false,
});

/**
 * Log an info message
 */
export function logInfo(message, meta = {}) {
  logger.info(message, meta);
}

/**
 * Log a warning message
 */
export function logWarn(message, meta = {}) {
  logger.warn(message, meta);
}

/**
 * Log an error message
 */
export function logError(message, error = null, meta = {}) {
  const errorData = {
    ...meta,
    ...(error && {
      error: {
        message: error.message,
        stack: error.stack,
        ...(error.code && { code: error.code }),
      },
    }),
  };
  logger.error(message, errorData);
}

/**
 * Log a debug message
 */
export function logDebug(message, meta = {}) {
  logger.debug(message, meta);
}

/**
 * Log HTTP request
 */
export function logHttp(message, meta = {}) {
  logger.http(message, meta);
}

/**
 * Log database query
 */
export function logQuery(query, duration, meta = {}) {
  logger.debug('Database Query', {
    query,
    duration: `${duration}ms`,
    ...meta,
  });
}

/**
 * Log API request
 */
export function logApiRequest(method, path, statusCode, duration, meta = {}) {
  const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'http';
  logger[level]('API Request', {
    method,
    path,
    statusCode,
    duration: `${duration}ms`,
    ...meta,
  });
}

/**
 * Log authentication event
 */
export function logAuth(event, userId, success, meta = {}) {
  const level = success ? 'info' : 'warn';
  logger[level]('Authentication Event', {
    event,
    userId,
    success,
    ...meta,
  });
}

/**
 * Log security event
 */
export function logSecurity(event, severity, meta = {}) {
  const level = severity === 'high' ? 'error' : severity === 'medium' ? 'warn' : 'info';
  logger[level]('Security Event', {
    event,
    severity,
    ...meta,
  });
}

/**
 * Log performance metric
 */
export function logPerformance(metric, value, unit, meta = {}) {
  logger.info('Performance Metric', {
    metric,
    value,
    unit,
    ...meta,
  });
}

/**
 * Create a child logger with additional context
 */
export function createChildLogger(context) {
  return logger.child(context);
}

export default logger;
