import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import helmet from 'helmet';
import { WinstonModule } from 'nest-winston';
import { AppModule } from './app.module';
import { createWinstonOptions } from './common/logger/winston.config';
import { requestIdMiddleware } from './common/middleware/request-id.middleware';
import { createValidationPipe } from './common/pipes/validation-pipe.factory';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: WinstonModule.createLogger(
      createWinstonOptions(process.env.NODE_ENV ?? 'development', process.env.LOG_LEVEL ?? 'info'),
    ),
  });

  const configService = app.get(ConfigService);
  const nodeEnv = configService.get<string>('nodeEnv', 'development');
  const port = configService.get<number>('port', 4000);
  const corsOrigins = configService.get<string[]>('corsOrigins', ['http://localhost:3000']);

  // Railway (and any PaaS) terminates TLS at a proxy: without this the
  // rate limiter would see one shared IP for the entire internet.
  app.set('trust proxy', 1);

  app.use(requestIdMiddleware);
  app.use(
    helmet({
      // Relaxed script/style sources so the Swagger UI at /docs can boot.
      // The API itself serves JSON only, so the surface here is minimal.
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
      crossOriginEmbedderPolicy: false,
    }),
  );
  app.use(compression());

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    maxAge: 86_400,
  });

  app.useGlobalPipes(createValidationPipe());

  app.enableShutdownHooks();

  const swaggerConfig = new DocumentBuilder()
    .setTitle('LeadDesk Mini API')
    .setDescription(
      'Lead capture and lead management API. Every response uses the envelope `{ success, message, data }`.',
    )
    .setVersion('1.0.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'bearer')
    .addTag('Authentication', 'Admin sign-in and session validation')
    .addTag('Leads', 'Public capture and authenticated management')
    .addTag('Dashboard', 'Aggregated metrics')
    .addTag('Health', 'Liveness and readiness')
    .build();

  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, swaggerConfig), {
    swaggerOptions: { persistAuthorization: true },
    customSiteTitle: 'LeadDesk Mini API reference',
  });

  await app.listen(port, '0.0.0.0');

  const logger = new Logger('Bootstrap');
  logger.log(`LeadDesk Mini API running on port ${port} [${nodeEnv}]`);
  logger.log(`API reference available at /docs`);
}

void bootstrap();
