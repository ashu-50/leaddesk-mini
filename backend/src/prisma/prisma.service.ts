import { Injectable, Logger } from '@nestjs/common';
import type { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import type { AppConfiguration } from '../config/configuration';

/**
 * The single Prisma connection for the process.
 *
 * Prisma is the only component allowed to talk to PostgreSQL, and every query
 * it emits is parameterised — which is what makes SQL injection a non-issue
 * for this codebase.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor(configService: ConfigService<AppConfiguration, true>) {
    const nodeEnv = configService.get('nodeEnv', { infer: true });

    super({
      datasources: { db: { url: configService.get('database.url', { infer: true }) } },
      log: nodeEnv === 'development' ? ['warn', 'error'] : ['error'],
      errorFormat: 'minimal',
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
    this.logger.log('Database connection established');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log('Database connection closed');
  }

  /** Used by the health endpoint to prove the connection is actually usable. */
  async isHealthy(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      this.logger.error('Database health check failed', error instanceof Error ? error.stack : '');
      return false;
    }
  }
}
