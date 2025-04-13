/**
 * HTTP Status Codes as an enum for better code readability
 */
export enum HttpStatusCode {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503
}


/**
 * The response format for the API
 */
export interface ApiResponse {
  statusCode: HttpStatusCode;
  headers: {
    [key: string]: string;
  };
  body: string;
}
