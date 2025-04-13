import { IConnectionAckMessage, WebSocketMessageType } from '@common/models/websocket.model';
import { Logger } from '@common/utils/logger.util';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { webSocketService } from '../../services/websocket.service';

// Create a logger for this component
const logger = new Logger('WebSocketConnect');

/**
 * Lambda handler for WebSocket $connect route
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const connectionId = event.requestContext.connectionId;

  if (!connectionId) {
    logger.error('Connection ID not found in event');
    return {statusCode: 500, body: 'Connection ID not found'};
  }

  logger.info('WebSocket connection request', {connectionId});

  try {
    // Save the connection
    await webSocketService.saveConnection(connectionId);

    // Send acknowledgement message
    const ackMessage: IConnectionAckMessage = {
      type: WebSocketMessageType.CONNECTION_ACK,
      timestamp: new Date().toISOString(),
      connectionId
    };

    await webSocketService.sendMessage(connectionId, ackMessage);

    logger.info('WebSocket connection established', {connectionId});
    return {statusCode: 200, body: 'Connected'};
  } catch (error) {
    logger.logError('Error handling WebSocket connection', error, {connectionId});
    return {statusCode: 500, body: 'Failed to establish connection'};
  }
};
