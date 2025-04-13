/**
 * Standardized logging utilities for CloudWatch integration
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  source: string;

  [key: string]: any; // Additional context fields
}

/**
 * Creates a structured log entry and sends it to CloudWatch via console
 */
export function log(
  level: LogLevel,
  message: string,
  source: string,
  context: Record<string, any> = {}
): void {
  const logEntry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    source,
    ...context
  };

  // Use appropriate console method based on level
  switch (level) {
    case LogLevel.DEBUG:
      console.debug(JSON.stringify(logEntry));
      break;
    case LogLevel.INFO:
      console.info(JSON.stringify(logEntry));
      break;
    case LogLevel.WARN:
      console.warn(JSON.stringify(logEntry));
      break;
    case LogLevel.ERROR:
      console.error(JSON.stringify(logEntry));
      break;
  }
}

/**
 * Logger for specific components with predefined source
 */
export class Logger {
  private source: string;

  constructor(source: string) {
    this.source = source;
  }

  debug(message: string, context: Record<string, any> = {}): void {
    log(LogLevel.DEBUG, message, this.source, context);
  }

  info(message: string, context: Record<string, any> = {}): void {
    log(LogLevel.INFO, message, this.source, context);
  }

  warn(message: string, context: Record<string, any> = {}): void {
    log(LogLevel.WARN, message, this.source, context);
  }

  error(message: string, context: Record<string, any> = {}): void {
    log(LogLevel.ERROR, message, this.source, context);
  }

  /**
   * Logs errors with full context and stack trace if available
   */
  logError(message: string, error: unknown, context: Record<string, any> = {}): void {
    const errorContext = {
      ...context,
      errorName: error instanceof Error ? error.name : 'Unknown',
      errorMessage: error instanceof Error ? error.message : String(error),
      stackTrace: error instanceof Error ? error.stack : undefined
    };

    this.error(message, errorContext);
  }
}
