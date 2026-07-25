import { utilities as nestWinstonUtilities } from 'nest-winston';
import * as winston from 'winston';
import type { LoggerOptions } from 'winston';

/**
 * Development: colourised, human-readable, Nest-style output.
 * Production: single-line JSON so Railway/Datadog can index the fields.
 */
export function createWinstonOptions(nodeEnv: string, level: string): LoggerOptions {
  const isProduction = nodeEnv === 'production';

  const format = isProduction
    ? winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      )
    : winston.format.combine(
        winston.format.timestamp({ format: 'HH:mm:ss.SSS' }),
        winston.format.ms(),
        nestWinstonUtilities.format.nestLike('LeadDesk', {
          colors: true,
          prettyPrint: true,
        }),
      );

  return {
    level,
    format,
    silent: nodeEnv === 'test',
    transports: [new winston.transports.Console()],
  };
}
