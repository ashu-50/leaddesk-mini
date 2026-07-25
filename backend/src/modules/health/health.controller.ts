import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { PrismaService } from '../../prisma/prisma.service';

interface HealthReport {
  status: 'ok';
  uptime: number;
  database: 'up';
  timestamp: string;
}

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  /** Consumed by the Railway health check — must stay unauthenticated. */
  @Public()
  @Get()
  @ResponseMessage('Service is healthy')
  @ApiOperation({ summary: 'Liveness and database readiness probe' })
  @ApiOkResponse({ description: 'Service and database are reachable' })
  @ApiServiceUnavailableResponse({ description: 'Database is unreachable' })
  async check(): Promise<HealthReport> {
    const databaseIsUp = await this.prisma.isHealthy();

    if (!databaseIsUp) {
      throw new ServiceUnavailableException('Database is unreachable');
    }

    return {
      status: 'ok',
      uptime: Math.floor(process.uptime()),
      database: 'up',
      timestamp: new Date().toISOString(),
    };
  }
}
