/**
 * Validates a task request
 */
export function validateTaskRequest(taskId: string, answer: string): string | null {
  if (!taskId) {
    return 'Task ID is required and must be a string';
  }

  if (!answer) {
    return 'Answer is required and must be a string';
  }

  if (answer.trim().length === 0) {
    return 'Answer cannot be empty';
  }

  return null;
}
