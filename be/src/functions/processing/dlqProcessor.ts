import { ITaskMessage } from '@common/models/sqs.model';
import { Logger } from '@common/utils/logger.util';
import { SQSEvent, SQSRecord } from 'aws-lambda';

// Create a logger for DLQ processing
const logger = new Logger('DLQ-Processor');

/**
 * Lambda handler for processing messages from the Dead Letter Queue
 * Logs details about failed tasks to CloudWatch
 */
export const handler = async (event: SQSEvent): Promise<void> => {
  logger.info('Processing Dead Letter Queue messages', {
    recordCount: event.Records.length
  });

  for (const record of event.Records) {
    await processDlqRecord(record);
  }

  logger.info('DLQ processing completed');
};

/**
 * Process a single record from the DLQ
 */
async function processDlqRecord(record: SQSRecord): Promise<void> {
  try {
    // Parse the message body
    const taskMessage = JSON.parse(record.body) as ITaskMessage;
    const {taskId, attempt} = taskMessage;

    // Log detailed information about the failed task
    logger.error('Task processing failed permanently', {
      taskId,
      attempts: attempt,
      sqsMessageId: record.messageId,
      receiptHandle: record.receiptHandle,
      attributes: record.attributes,
      eventSourceARN: record.eventSourceARN,
      // You could extract more details from SQS message attributes if needed
      firstFailureTimestamp: record.attributes.ApproximateFirstReceiveTimestamp,
      sendTimestamp: record.attributes.SentTimestamp
    });

    // Here you could also implement additional actions for failed tasks:
    // - Send notifications to administrators
    // - Move the failed task to a separate storage for later analysis
    // - Attempt a different recovery strategy
  } catch (error) {
    logger.logError('Error processing DLQ message', error, {
      messageId: record.messageId,
      body: record.body
    });
  }
}
