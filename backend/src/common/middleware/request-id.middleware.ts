import { randomUUID } from 'node:crypto';
import type { NextFunction, Response } from 'express';
import type { RequestWithId } from '../interfaces/request-with-id.interface';

const REQUEST_ID_HEADER = 'x-request-id';

/**
 * Correlates a log line, an error response and a client-side bug report.
 * Honours an inbound `x-request-id` so an upstream gateway can propagate its
 * own identifier. Registered with `app.use()` before any route is matched.
 */
export function requestIdMiddleware(req: RequestWithId, res: Response, next: NextFunction): void {
  const incoming = req.headers[REQUEST_ID_HEADER];
  req.id = typeof incoming === 'string' && incoming.length > 0 ? incoming : randomUUID();
  res.setHeader(REQUEST_ID_HEADER, req.id);
  next();
}
