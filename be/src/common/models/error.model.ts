/**
 * Custom error types for better error handling
 */

/**
 * Base error class for the application
 */
export class ApplicationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error thrown when a task is not found
 */
export class TaskNotFoundError extends ApplicationError {
  constructor(taskId: string) {
    super(`Task with id ${taskId} not found`);
  }
}

/**
 * Error thrown when validation fails
 */
export class ValidationError extends ApplicationError {
  constructor(message: string) {
    super(message);
  }
}

/**
 * Error thrown when there's an issue with task processing
 */
export class TaskProcessingError extends ApplicationError {
  constructor(taskId: string, reason: string) {
    super(`Failed to process task ${taskId}: ${reason}`);
  }
}

/**
 * Error thrown when there's an issue with database operations
 */
export class DatabaseError extends ApplicationError {
  constructor(operation: string, detail: string) {
    super(`Database operation ${operation} failed: ${detail}`);
  }
}

/**
 * Error thrown when there's an issue with queue operations
 */
export class QueueError extends ApplicationError {
  constructor(operation: string, detail: string) {
    super(`Queue operation ${operation} failed: ${detail}`);
  }
}
