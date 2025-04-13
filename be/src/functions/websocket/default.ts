import { IErrorMessage, WebSocketMessageType } from '@common/models/websocket.model';
import { Logger } from '@common/utils/logger.util';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { webSocketService } from '../../services/websocket.service';

// Create a logger for this component
const logger = new Logger('WebSocketDefault');

/**
 * Lambda handler for WebSocket $default route
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const connectionId = event.requestContext.connectionId;

  if (!connectionId) {
    logger.error('Connection ID not found in event');
    return {statusCode: 500, body: 'Connection ID not found'};
  }

  logger.info('WebSocket default route request', {
    connectionId,
    body: event.body
  });

  try {
    // The default handler doesn't need to process messages
    // but we can send an error message to indicate unsupported operations
    const errorMessage: IErrorMessage = {
      type: WebSocketMessageType.ERROR,
      timestamp: new Date().toISOString(),
      error: 'Unsupported message type. This WebSocket endpoint is for notifications only.'
    };

    await webSocketService.sendMessage(connectionId, errorMessage);

    logger.info('Sent error message for unsupported operation', {connectionId});
    return {statusCode: 200, body: 'Message processed'};
  } catch (error) {
    logger.logError('Error handling WebSocket message', error, {connectionId});
    return {statusCode: 500, body: 'Failed to process message'};
  }
};
