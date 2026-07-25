import { ArgumentsHost, Catch, HttpException, HttpStatus, Logger } from '@nestjs/common';
import type { ExceptionFilter } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Response } from 'express';
import type { ApiErrorResponse } from '../interfaces/api-response.interface';
import type { RequestWithId } from '../interfaces/request-with-id.interface';

/** Anything at or above this is our fault, not the caller's, and is logged as an error. */
const SERVER_ERROR_THRESHOLD: number = HttpStatus.INTERNAL_SERVER_ERROR;

interface NormalisedError {
  status: number;
  message: string;
  errors: string[];
}

interface HttpExceptionPayload {
  message?: string | string[];
  error?: string;
}

/**
 * Single exit point for every error in the application.
 *
 * Guarantees:
 *  - one response shape for clients (`ApiErrorResponse`);
 *  - stack traces and driver internals are logged, never serialised to clients;
 *  - Prisma error codes are translated into meaningful HTTP status codes.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<RequestWithId>();

    const { status, message, errors } = this.normalise(exception);

    const body: ApiErrorResponse = {
      success: false,
      message,
      statusCode: status,
      errors,
      path: request.originalUrl,
      timestamp: new Date().toISOString(),
      requestId: request.id ?? 'unknown',
    };

    this.log(exception, body, request);
    response.status(status).json(body);
  }

  private normalise(exception: unknown): NormalisedError {
    if (exception instanceof HttpException) {
      return this.fromHttpException(exception);
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.fromPrismaKnownError(exception);
    }

    if (exception instanceof Prisma.PrismaClientValidationError) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'The request could not be processed',
        errors: ['Invalid query parameters'],
      };
    }

    if (exception instanceof Prisma.PrismaClientInitializationError) {
      return {
        status: HttpStatus.SERVICE_UNAVAILABLE,
        message: 'Service temporarily unavailable',
        errors: ['The database is not reachable right now'],
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      errors: [],
    };
  }

  private fromHttpException(exception: HttpException): NormalisedError {
    const status = exception.getStatus();
    const payload = exception.getResponse();

    if (typeof payload === 'string') {
      return { status, message: payload, errors: [] };
    }

    const { message, error } = payload as HttpExceptionPayload;

    if (Array.isArray(message)) {
      return { status, message: 'Validation failed', errors: message };
    }

    return { status, message: message ?? error ?? exception.message, errors: [] };
  }

  private fromPrismaKnownError(exception: Prisma.PrismaClientKnownRequestError): NormalisedError {
    switch (exception.code) {
      case 'P2002':
        return {
          status: HttpStatus.CONFLICT,
          message: 'A record with these details already exists',
          errors: [],
        };
      case 'P2003':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'The request references a record that does not exist',
          errors: [],
        };
      case 'P2025':
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'The requested record was not found',
          errors: [],
        };
      default:
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Internal server error',
          errors: [],
        };
    }
  }

  private log(exception: unknown, body: ApiErrorResponse, request: RequestWithId): void {
    const context = `${request.method} ${request.originalUrl} [${body.requestId}]`;

    if (body.statusCode >= SERVER_ERROR_THRESHOLD) {
      const stack = exception instanceof Error ? exception.stack : String(exception);
      this.logger.error(`${context} → ${body.statusCode}`, stack);
      return;
    }

    this.logger.warn(`${context} → ${body.statusCode} ${body.message}`);
  }
}
