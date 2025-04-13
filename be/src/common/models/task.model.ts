/**
 * Represents a task in the system with its processing status
 */
export interface ITask {
  taskId: string;
  answer: string;
  status: TaskStatus;
  retries: number;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Possible statuses for a task
 */
export enum TaskStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  PROCESSED = 'PROCESSED',
  FAILED = 'FAILED'
}

/**
 * The request body for creating a new task
 */
export interface ICreateTaskRequest {
  taskId: string;
  answer: string;
}
