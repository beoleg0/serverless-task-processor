import { ITask } from '@common/models/task.model';

/**
 * WebSocket connection record format
 */
export interface IWebSocketConnection {
  connectionId: string;
  createdAt: string;
}

/**
 * WebSocket message types
 */
export enum WebSocketMessageType {
  TASK_STATUS_UPDATE = 'TASK_STATUS_UPDATE',
  ERROR = 'ERROR',
  CONNECTION_ACK = 'CONNECTION_ACK'
}

/**
 * Base WebSocket message format
 */
export interface IWebSocketMessage {
  type: WebSocketMessageType;
  timestamp: string;
}

/**
 * Task status update message format
 */
export interface ITaskStatusUpdateMessage extends IWebSocketMessage {
  type: WebSocketMessageType.TASK_STATUS_UPDATE;
  task: ITask;
}

/**
 * Error message format
 */
export interface IErrorMessage extends IWebSocketMessage {
  type: WebSocketMessageType.ERROR;
  error: string;
}

/**
 * Connection acknowledgement message format
 */
export interface IConnectionAckMessage extends IWebSocketMessage {
  type: WebSocketMessageType.CONNECTION_ACK;
  connectionId: string;
}
