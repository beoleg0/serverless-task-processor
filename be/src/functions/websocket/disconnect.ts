import { Logger } from '@common/utils/logger.util';
import { webSocketService } from '@services/websocket.service';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

// Create a logger for this component
const logger = new Logger('WebSocketDisconnect');

/**
 * Lambda handler for WebSocket $disconnect route
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const connectionId = event.requestContext.connectionId;

  if (!connectionId) {
    logger.error('Connection ID not found in event');
    return {statusCode: 500, body: 'Connection ID not found'};
  }

  logger.info('WebSocket disconnect request', {connectionId});

  try {
    // Delete the connection
    await webSocketService.deleteConnection(connectionId);

    logger.info('WebSocket connection terminated', {connectionId});
    return {statusCode: 200, body: 'Disconnected'};
  } catch (error) {
    logger.logError('Error handling WebSocket disconnection', error, {connectionId});
    return {statusCode: 500, body: 'Failed to disconnect properly'};
  }
};
