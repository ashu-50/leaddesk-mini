/**
 * Loaded by Jest via `setupFiles` **before** any application module is
 * imported. `ConfigModule.forRoot()` validates the environment at import time,
 * so these values must exist before `AppModule` is pulled in.
 *
 * The database URL is never dialled: `PrismaService` is replaced by an
 * in-memory double in the e2e suite.
 */
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL ??= 'postgresql://leaddesk:leaddesk@localhost:5432/leaddesk_test';
process.env.JWT_SECRET = 'end-to-end-testing-secret-value-32-chars-minimum';
process.env.JWT_EXPIRES_IN = '1h';
process.env.BCRYPT_SALT_ROUNDS = '10';
process.env.THROTTLE_LIMIT = '1000';
process.env.THROTTLE_TTL = '60000';
process.env.LOG_LEVEL = 'error';

export {};
