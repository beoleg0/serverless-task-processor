import { ApiResponse, HttpStatusCode } from '@common/models/api.model';

/**
 * Creates a standardized API response
 */
export function createResponse(statusCode: HttpStatusCode, body: any): ApiResponse {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    },
    body: JSON.stringify(body)
  };
}
