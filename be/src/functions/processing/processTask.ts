import { TaskProcessingError } from '@common/models/error.model';
import { ITaskMessage } from '@common/models/sqs.model';
import { TaskStatus } from '@common/models/task.model';
import { Logger } from '@common/utils/logger.util';
import { shouldSimulateFailure } from '@common/utils/simulate-failure.util';
import { dynamoService } from '@services/dynamo.service';
import { sqsService } from '@services/sqs.service';
import { SQSEvent, SQSRecord } from 'aws-lambda';

// Create a logger for this component
const logger = new Logger('TaskProcessor');

/**
 * Lambda handler for processing tasks from SQS
 */
export const handler = async (event: SQSEvent): Promise<void> => {
  logger.info('Starting task processing', {recordCount: event.Records.length});

  // Process each record from SQS (should only be one with our configuration)
  for (const record of event.Records) {
    await processRecord(record);
  }

  logger.info('Task processing completed');
};

/**
 * Process a single SQS record
 */
async function processRecord(record: SQSRecord): Promise<void> {
  let taskMessage: ITaskMessage;

  try {
    // Parse the message body
    taskMessage = JSON.parse(record.body) as ITaskMessage;
    const {taskId, attempt} = taskMessage;

    logger.info('Processing task', {
      taskId,
      attempt,
      messageId: record.messageId,
      receiptHandle: record.receiptHandle
    });

    // Update task status to PROCESSING
    await dynamoService.updateTaskStatus(taskId, TaskStatus.PROCESSING, attempt);

    // Simulate processing
    await simulateTaskProcessing(taskId);

    // Update task status to PROCESSED on success
    await dynamoService.updateTaskStatus(taskId, TaskStatus.PROCESSED, attempt);

    logger.info('Successfully processed task', {taskId, attempt});
  } catch (error) {
    if (!(error instanceof TaskProcessingError)) {
      logger.logError('Unexpected error processing task', error, {
        messageId: record.messageId
      });
      return;
    }

    const {taskId, attempt} = taskMessage!;
    logger.error('Failed to process task', {
      taskId,
      attempt,
      messageId: record.messageId,
      errorMessage: error.message
    });

    // Check if we should retry
    if (attempt < 2) {  // Max 2 retries as per requirements
      // Send back to queue with incremented attempt count
      await sqsService.sendTaskToQueue(taskId, attempt + 1);
      logger.info('Scheduled retry for task', {
        taskId,
        currentAttempt: attempt,
        nextAttempt: attempt + 1
      });

      // Update task status with retry info
      await dynamoService.updateTaskStatus(
        taskId,
        TaskStatus.PENDING,
        attempt + 1,
        error.message
      );
    } else {
      // Max retries reached, update status to FAILED
      await dynamoService.updateTaskStatus(
        taskId,
        TaskStatus.FAILED,
        attempt,
        error.message
      );
      logger.warn('Task failed permanently, sent to DLQ', {
        taskId,
        totalAttempts: attempt + 1
      });
      // No need to send to DLQ manually, SQS will do it based on the redrive policy
    }
  }
}

/**
 * Simulate task processing with a random chance of failure
 */
async function simulateTaskProcessing(taskId: string): Promise<void> {
  // Add a small delay to simulate processing time (500-2000ms)
  const processingTime = 500 + Math.floor(Math.random() * 1500);
  logger.debug('Simulating processing delay', {taskId, processingTimeMs: processingTime});

  await new Promise(resolve => setTimeout(resolve, processingTime));

  // Simulate failure based on the 30% failure rate requirement
  if (shouldSimulateFailure()) {
    logger.debug('Simulating processing failure', {taskId});
    throw new TaskProcessingError(taskId, 'Simulated processing failure');
  }

  logger.debug('Task processing simulation successful', {taskId});
}
