import { ValidationPipe } from '@nestjs/common';

/**
 * One definition of "valid request", shared by the running application and the
 * end-to-end suite so tests can never pass against looser rules than production.
 */
export const createValidationPipe = (): ValidationPipe =>
  new ValidationPipe({
    // Strip unknown keys, then reject the request if any were sent.
    whitelist: true,
    forbidNonWhitelisted: true,
    // Turn plain JSON into DTO instances so @Transform and getters run.
    transform: true,
    transformOptions: { exposeDefaultValues: true },
    // Never echo the submitted value back in an error message.
    validationError: { target: false, value: false },
  });
