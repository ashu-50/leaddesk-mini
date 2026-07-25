/**
 * Every successful response leaving the API has this exact shape.
 * Enforced globally by `ResponseInterceptor`.
 */
export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

/**
 * Every error leaving the API has this exact shape.
 * Enforced globally by `AllExceptionsFilter`.
 */
export interface ApiErrorResponse {
  success: false;
  message: string;
  statusCode: number;
  errors: string[];
  path: string;
  timestamp: string;
  requestId: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
