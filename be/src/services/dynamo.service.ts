import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  GetCommandInput,
  PutCommand,
  PutCommandInput,
  ScanCommand,
  ScanCommandInput,
  UpdateCommand,
  UpdateCommandInput
} from '@aws-sdk/lib-dynamodb';
import { DatabaseError, TaskNotFoundError } from '@common/models/error.model';
import { ITask, TaskStatus } from '@common/models/task.model';
import { Logger } from '@common/utils/logger.util';

// Create a logger for this service
const logger = new Logger('DynamoService');

// Initialize DynamoDB clients
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TASKS_TABLE = process.env.TASKS_TABLE || 'TasksTable';

logger.info('DynamoDB service initialized', {tableName: TASKS_TABLE});

/**
 * Service for handling DynamoDB operations related to tasks
 */
export class DynamoService {
  /**
   * Creates a new task in the database
   */
  async createTask(task: ITask): Promise<ITask> {
    try {
      logger.debug('Creating task in DynamoDB', {taskId: task.taskId});

      const params: PutCommandInput = {
        TableName: TASKS_TABLE,
        Item: task,
        ConditionExpression: 'attribute_not_exists(taskId)'
      };

      await docClient.send(new PutCommand(params));
      logger.info('Task created successfully', {taskId: task.taskId});
      return task;
    } catch (error) {
      logger.logError('Error creating task in DynamoDB', error, {taskId: task.taskId});
      throw new DatabaseError('createTask', error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Retrieves a task by its ID
   */
  async getTask(taskId: string): Promise<ITask> {
    try {
      logger.debug('Retrieving task from DynamoDB', {taskId});

      const params: GetCommandInput = {
        TableName: TASKS_TABLE,
        Key: {taskId}
      };

      const response = await docClient.send(new GetCommand(params));

      if (!response.Item) {
        logger.warn('Task not found', {taskId});
        throw new TaskNotFoundError(taskId);
      }

      logger.debug('Task retrieved successfully', {taskId});
      return response.Item as ITask;
    } catch (error) {
      if (error instanceof TaskNotFoundError) {
        throw error;
      }
      logger.logError('Error retrieving task from DynamoDB', error, {taskId});
      throw new DatabaseError('getTask', error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Updates a task's status
   */
  async updateTaskStatus(
    taskId: string,
    status: TaskStatus,
    retries: number = 0,
    errorMessage?: string
  ): Promise<ITask> {
    try {
      logger.debug('Updating task status in DynamoDB', {
        taskId,
        status,
        retries,
        hasErrorMessage: !!errorMessage
      });

      const updateExpression = errorMessage
        ? 'SET #status = :status, retries = :retries, errorMessage = :errorMessage, updatedAt = :updatedAt'
        : 'SET #status = :status, retries = :retries, updatedAt = :updatedAt REMOVE errorMessage';

      const expressionAttributeValues: any = {
        ':status': status,
        ':retries': retries,
        ':updatedAt': new Date().toISOString()
      };

      if (errorMessage) {
        expressionAttributeValues[':errorMessage'] = errorMessage;
      }

      const params: UpdateCommandInput = {
        TableName: TASKS_TABLE,
        Key: {taskId},
        UpdateExpression: updateExpression,
        ExpressionAttributeNames: {'#status': 'status'},
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW'
      };

      const response = await docClient.send(new UpdateCommand(params));

      if (!response.Attributes) {
        logger.warn('Task not found during update', {taskId});
        throw new TaskNotFoundError(taskId);
      }

      logger.info('Task status updated successfully', {
        taskId,
        status,
        retries
      });

      return response.Attributes as ITask;
    } catch (error) {
      if (error instanceof TaskNotFoundError) {
        throw error;
      }
      logger.logError('Error updating task status in DynamoDB', error, {
        taskId,
        status,
        retries
      });
      throw new DatabaseError('updateTaskStatus', error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Gets all tasks
   */
  async getAllTasks(): Promise<ITask[]> {
    try {
      logger.debug('Retrieving all tasks from DynamoDB');

      const params: ScanCommandInput = {
        TableName: TASKS_TABLE
      };

      const response = await docClient.send(new ScanCommand(params));
      const tasks = (response.Items as ITask[]) || [];

      logger.info('Retrieved all tasks successfully', {
        count: tasks.length,
        scannedCount: response.ScannedCount
      });

      return tasks;
    } catch (error) {
      logger.logError('Error retrieving all tasks from DynamoDB', error);
      throw new DatabaseError('getAllTasks', error instanceof Error ? error.message : String(error));
    }
  }
}

// Export singleton instance
export const dynamoService = new DynamoService();
