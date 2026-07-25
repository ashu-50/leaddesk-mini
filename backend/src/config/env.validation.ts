import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
  validateSync,
} from 'class-validator';

export enum NodeEnv {
  Development = 'development',
  Test = 'test',
  Production = 'production',
}

/**
 * The application refuses to boot with an invalid environment.
 * Failing at startup is always cheaper than failing on the first request.
 */
export class EnvironmentVariables {
  @IsEnum(NodeEnv)
  @IsOptional()
  NODE_ENV: NodeEnv = NodeEnv.Development;

  @IsInt()
  @Min(1)
  @Max(65_535)
  @IsOptional()
  PORT: number = 4000;

  @IsString()
  @IsNotEmpty({ message: 'DATABASE_URL is required (PostgreSQL connection string)' })
  DATABASE_URL: string;

  @IsString()
  @MinLength(32, { message: 'JWT_SECRET must be at least 32 characters long' })
  JWT_SECRET: string;

  @IsString()
  @IsOptional()
  JWT_EXPIRES_IN: string = '1d';

  @IsInt()
  @Min(10, { message: 'BCRYPT_SALT_ROUNDS must be at least 10 to be considered safe' })
  @Max(15)
  @IsOptional()
  BCRYPT_SALT_ROUNDS: number = 12;

  @IsString()
  @IsOptional()
  CORS_ORIGINS: string = 'http://localhost:3000';

  @IsString()
  @IsOptional()
  LOG_LEVEL: string = 'info';

  @IsInt()
  @Min(1_000)
  @IsOptional()
  THROTTLE_TTL: number = 60_000;

  @IsInt()
  @Min(1)
  @IsOptional()
  THROTTLE_LIMIT: number = 100;

  @IsInt()
  @Min(1_000)
  @IsOptional()
  AUTH_THROTTLE_TTL: number = 60_000;

  @IsInt()
  @Min(1)
  @IsOptional()
  AUTH_THROTTLE_LIMIT: number = 5;
}

export function validateEnvironment(config: Record<string, unknown>): EnvironmentVariables {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
    exposeDefaultValues: true,
  });

  const errors = validateSync(validated, {
    skipMissingProperties: false,
    whitelist: false,
  });

  if (errors.length > 0) {
    const details = errors
      .map((error) => Object.values(error.constraints ?? {}).join(', '))
      .filter(Boolean)
      .join('\n  - ');

    throw new Error(`Invalid environment configuration:\n  - ${details}`);
  }

  return validated;
}
