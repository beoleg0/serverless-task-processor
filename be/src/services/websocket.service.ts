import { ApiGatewayManagementApiClient, PostToConnectionCommand } from '@aws-sdk/client-apigatewaymanagementapi';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DeleteCommand, DynamoDBDocumentClient, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { IWebSocketConnection, IWebSocketMessage } from '@common/models/websocket.model';
import { Logger } from '@common/utils/logger.util';

// Create a logger for this service
const logger = new Logger('WebSocketService');

// Initialize DynamoDB client
const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const CONNECTIONS_TABLE = process.env.CONNECTIONS_TABLE || 'WebSocketConnectionsTable';

// Extract the WebSocket API endpoint from environment variables
const WEBSOCKET_API_ENDPOINT = process.env.WEBSOCKET_API_ENDPOINT || '';
const apiEndpoint = new URL(WEBSOCKET_API_ENDPOINT);

// Initialize API Gateway Management API client
const apiGatewayClient = new ApiGatewayManagementApiClient({
  endpoint: `${apiEndpoint.hostname}${apiEndpoint.pathname}`
});

/**
 * Service for handling WebSocket connections and broadcasts
 */
export class WebSocketService {
  /**
   * Saves a new WebSocket connection
   */
  async saveConnection(connectionId: string): Promise<void> {
    try {
      logger.debug('Saving WebSocket connection', {connectionId});

      const connection: IWebSocketConnection = {
        connectionId,
        createdAt: new Date().toISOString()
      };

      await docClient.send(new PutCommand({
        TableName: CONNECTIONS_TABLE,
        Item: connection
      }));

      logger.info('WebSocket connection saved', {connectionId});
    } catch (error) {
      logger.logError('Error saving WebSocket connection', error, {connectionId});
      throw error;
    }
  }

  /**
   * Deletes a WebSocket connection
   */
  async deleteConnection(connectionId: string): Promise<void> {
    try {
      logger.debug('Deleting WebSocket connection', {connectionId});

      await docClient.send(new DeleteCommand({
        TableName: CONNECTIONS_TABLE,
        Key: {connectionId}
      }));

      logger.info('WebSocket connection deleted', {connectionId});
    } catch (error) {
      logger.logError('Error deleting WebSocket connection', error, {connectionId});
      throw error;
    }
  }

  /**
   * Gets all active WebSocket connections
   */
  async getAllConnections(): Promise<IWebSocketConnection[]> {
    try {
      logger.debug('Getting all WebSocket connections');

      const result = await docClient.send(new ScanCommand({
        TableName: CONNECTIONS_TABLE
      }));

      const connections = (result.Items as IWebSocketConnection[]) || [];
      logger.info('Retrieved all WebSocket connections', {count: connections.length});

      return connections;
    } catch (error) {
      logger.logError('Error getting WebSocket connections', error);
      throw error;
    }
  }

  /**
   * Sends a message to a specific WebSocket connection
   */
  async sendMessage(connectionId: string, message: IWebSocketMessage): Promise<void> {
    try {
      logger.debug('Sending message to WebSocket connection', {
        connectionId,
        messageType: message.type
      });

      await apiGatewayClient.send(new PostToConnectionCommand({
        ConnectionId: connectionId,
        Data: Buffer.from(JSON.stringify(message))
      }));

      logger.debug('Message sent to WebSocket connection', {connectionId});
    } catch (error) {
      if ((error as any).name === 'GoneException') {
        // Connection is no longer available, clean it up
        logger.warn('WebSocket connection no longer available, deleting', {connectionId});
        await this.deleteConnection(connectionId);
        return;
      }

      logger.logError('Error sending message to WebSocket connection', error, {connectionId});
      throw error;
    }
  }

  /**
   * Broadcasts a message to all active WebSocket connections
   */
  async broadcastMessage(message: IWebSocketMessage): Promise<void> {
    try {
      logger.info('Broadcasting message to all WebSocket connections', {messageType: message.type});

      const connections = await this.getAllConnections();

      if (connections.length === 0) {
        logger.info('No active WebSocket connections to broadcast to');
        return;
      }

      logger.info(`Broadcasting to ${connections.length} connections`);

      // Send message to each connection
      const sendPromises = connections.map(async (connection) => {
        try {
          await this.sendMessage(connection.connectionId, message);
        } catch (error) {
          // Log error but continue with other connections
          logger.warn(`Failed to send to connection ${connection.connectionId}`, {
            error: error instanceof Error ? error.message : String(error)
          });
        }
      });

      await Promise.all(sendPromises);
      logger.info('Broadcast completed');
    } catch (error) {
      logger.logError('Error broadcasting message', error);
      throw error;
    }
  }
}

// Export singleton instance
export const webSocketService = new WebSocketService();
