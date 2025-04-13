import { HttpStatusCode } from '@common/models/api.model';
import { ValidationError } from '@common/models/error.model';
import { ICreateTaskRequest, ITask, TaskStatus } from '@common/models/task.model';
import { createResponse } from '@common/utils/api.util';
import { Logger } from '@common/utils/logger.util';
import { validateTaskRequest } from '@common/utils/task.util';
import { dynamoService } from '@services/dynamo.service';
import { sqsService } from '@services/sqs.service';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';

// Create a logger for this component
const logger = new Logger('CreateTaskAPI');

/**
 * Lambda handler for creating a new task
 * Endpoint: POST /tasks
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Create task request received', {
    path: event.path,
    httpMethod: event.httpMethod,
    hasBody: !!event.body
  });

  try {
    // Parse request body
    if (!event.body) {
      logger.warn('Missing request body');
      throw new ValidationError('Request body is required');
    }

    const requestBody: ICreateTaskRequest = JSON.parse(event.body);
    const {taskId = uuidv4(), answer} = requestBody;

    logger.info('Parsed task request', {taskId});

    // Validate request
    const validationError = validateTaskRequest(taskId, answer);
    if (validationError) {
      logger.warn('Validation error', {taskId, error: validationError});
      throw new ValidationError(validationError);
    }

    // Create a new task
    const now = new Date().toISOString();
    const task: ITask = {
      taskId,
      answer,
      status: TaskStatus.PENDING,
      retries: 0,
      createdAt: now,
      updatedAt: now
    };

    logger.debug('Creating task in database', {taskId});
    // Save the task to DynamoDB
    await dynamoService.createTask(task);

    logger.debug('Sending task to processing queue', {taskId});
    // Send the task to SQS for processing
    await sqsService.sendTaskToQueue(task.taskId);

    logger.info('Task created successfully', {taskId});
    // Return the created task
    return createResponse(HttpStatusCode.CREATED, {message: 'Task created successfully', task});
  } catch (error) {
    if (error instanceof ValidationError) {
      logger.warn('Validation error in create task', {errorMessage: error.message});
      return createResponse(HttpStatusCode.BAD_REQUEST, {message: error.message});
    }

    logger.logError('Error creating task', error);
    return createResponse(HttpStatusCode.INTERNAL_SERVER_ERROR, {
      message: 'An error occurred while creating the task',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
