import { Injectable, Logger } from '@nestjs/common';
import type { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import type { Response } from 'express';
import type { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import type { RequestWithId } from '../interfaces/request-with-id.interface';

/**
 * Structured access log. Errors are logged by `AllExceptionsFilter`, so this
 * interceptor only reports completed responses to avoid duplicate noise.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<RequestWithId>();
    const response = http.getResponse<Response>();
    const startedAt = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startedAt;
        this.logger.log(
          `${request.method} ${request.originalUrl} ${response.statusCode} ${duration}ms [${request.id}]`,
        );
      }),
    );
  }
}
