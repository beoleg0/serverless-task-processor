import { HttpStatusCode } from '@common/models/api.model';
import { createResponse } from '@common/utils/api.util';

import { Logger } from '@common/utils/logger.util';
import { dynamoService } from '@services/dynamo.service';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

// Create a logger for this component
const logger = new Logger('GetTasksAPI');

/**
 * Lambda handler for retrieving all tasks
 * Endpoint: GET /tasks
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Get tasks request received', {
    path: event.path,
    httpMethod: event.httpMethod,
    queryStringParams: event.queryStringParameters
  });

  try {
    logger.debug('Fetching all tasks from database');
    // Get all tasks from DynamoDB
    const tasks = await dynamoService.getAllTasks();

    logger.info('Tasks retrieved successfully', {count: tasks.length});
    // Return the tasks
    return createResponse(HttpStatusCode.OK, {tasks});
  } catch (error) {
    logger.logError('Error retrieving tasks', error);

    return createResponse(HttpStatusCode.INTERNAL_SERVER_ERROR, {
      message: 'An error occurred while retrieving tasks',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
