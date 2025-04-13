/**
 * SQS message format for task processing
 */
export interface ITaskMessage {
  taskId: string;
  attempt: number;
}
