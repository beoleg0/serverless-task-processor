import { SendMessageCommand, SendMessageCommandInput, SQSClient } from '@aws-sdk/client-sqs';
import { QueueError } from '@common/models/error.model';
import { ITaskMessage } from '@common/models/sqs.model';
import { calculateBackoffDelay } from '@common/utils/calculate-backoff-delay.util';
import { Logger } from '@common/utils/logger.util';

// Create a logger for this service
const logger = new Logger('SQSService');

// Initialize SQS client
const sqsClient = new SQSClient({});
const TASK_QUEUE_URL = process.env.TASK_QUEUE_URL || '';

logger.info('SQS service initialized', {queueUrl: TASK_QUEUE_URL});

/**
 * Service for handling SQS operations
 */
export class SqsService {
  /**
   * Sends a task to the processing queue with exponential backoff delay
   */
  async sendTaskToQueue(taskId: string, attempt: number = 0): Promise<void> {
    try {
      // Calculate delay based on retry attempt
      const delayMs = attempt > 0
        ? calculateBackoffDelay(attempt - 1)
        : 0; // No delay for first attempt

      const delaySeconds = Math.min(Math.floor(delayMs / 1000), 900); // Max 15 minutes (900 seconds)

      logger.debug('Preparing to send task to SQS', {
        taskId,
        attempt,
        delaySeconds,
        delayMs
      });

      const message: ITaskMessage = {taskId, attempt};

      const params: SendMessageCommandInput = {
        QueueUrl: TASK_QUEUE_URL,
        MessageBody: JSON.stringify(message),
        DelaySeconds: delaySeconds
      };

      await sqsClient.send(new SendMessageCommand(params));

      logger.info('Task sent to SQS successfully', {
        taskId,
        attempt,
        delaySeconds
      });
    } catch (error) {
      logger.logError('Error sending task to SQS', error, {
        taskId,
        attempt
      });
      throw new QueueError('sendTaskToQueue', error instanceof Error ? error.message : String(error));
    }
  }
}

// Export singleton instance
export const sqsService = new SqsService();
