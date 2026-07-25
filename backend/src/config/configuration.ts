export type NodeEnvironment = 'development' | 'test' | 'production';

export interface AppConfiguration {
  nodeEnv: NodeEnvironment;
  port: number;
  logLevel: string;
  corsOrigins: string[];
  database: {
    url: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  security: {
    bcryptSaltRounds: number;
  };
  throttle: {
    ttl: number;
    limit: number;
    authTtl: number;
    authLimit: number;
  };
}

const toNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && value !== undefined && value !== '' ? parsed : fallback;
};

const toList = (value: string | undefined, fallback: string[]): string[] => {
  if (!value) return fallback;
  const entries = value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
  return entries.length > 0 ? entries : fallback;
};

/**
 * Single source of truth for runtime configuration.
 * Nothing in the codebase reads `process.env` directly — everything goes
 * through `ConfigService<AppConfiguration, true>` so values stay typed.
 */
export const configuration = (): AppConfiguration => ({
  nodeEnv: (process.env.NODE_ENV as NodeEnvironment) ?? 'development',
  port: toNumber(process.env.PORT, 4000),
  logLevel: process.env.LOG_LEVEL ?? 'info',
  corsOrigins: toList(process.env.CORS_ORIGINS, ['http://localhost:3000']),
  database: {
    url: process.env.DATABASE_URL ?? '',
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? '',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
  },
  security: {
    bcryptSaltRounds: toNumber(process.env.BCRYPT_SALT_ROUNDS, 12),
  },
  throttle: {
    ttl: toNumber(process.env.THROTTLE_TTL, 60_000),
    limit: toNumber(process.env.THROTTLE_LIMIT, 100),
    authTtl: toNumber(process.env.AUTH_THROTTLE_TTL, 60_000),
    authLimit: toNumber(process.env.AUTH_THROTTLE_LIMIT, 5),
  },
});
