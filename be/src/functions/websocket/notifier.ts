import { unmarshall } from '@aws-sdk/util-dynamodb';
import { ITask } from '@common/models/task.model';
import { ITaskStatusUpdateMessage, WebSocketMessageType } from '@common/models/websocket.model';
import { Logger } from '@common/utils/logger.util';
import { webSocketService } from '@services/websocket.service';
import { DynamoDBStreamEvent } from 'aws-lambda';

// Create a logger for this component
const logger = new Logger('TaskStatusNotifier');

/**
 * Lambda handler for notifying clients about task status changes
 * This is triggered by the DynamoDB Stream of the TasksTable
 */
export const handler = async (event: DynamoDBStreamEvent): Promise<void> => {
  logger.info('Task status change notification triggered', {
    recordCount: event.Records.length
  });

  for (const record of event.Records) {
    try {
      // Skip anything that's not a MODIFY event (we only care about updates)
      if (record.eventName !== 'MODIFY') {
        logger.debug('Skipping non-MODIFY event', {eventName: record.eventName});
        continue;
      }

      // Get the new (updated) image of the DynamoDB record
      if (!record.dynamodb?.NewImage) {
        logger.warn('New image not found in DynamoDB stream record');
        continue;
      }

      // Convert DynamoDB record to Task object
      const task = unmarshall(record.dynamodb.NewImage as any) as ITask;

      logger.info('Task status changed, notifying clients', {
        taskId: task.taskId,
        status: task.status,
        retries: task.retries
      });

      // Create the notification message
      const statusUpdateMessage: ITaskStatusUpdateMessage = {
        type: WebSocketMessageType.TASK_STATUS_UPDATE,
        timestamp: new Date().toISOString(),
        task
      };

      // Broadcast to all connected clients
      await webSocketService.broadcastMessage(statusUpdateMessage);

      logger.info('Status update notification sent successfully', {taskId: task.taskId});
    } catch (error) {
      logger.logError('Error processing status change notification', error);
      // Continue processing other records even if one fails
    }
  }

  logger.info('Task status notification processing completed');
};
