import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { DashboardService } from './dashboard.service';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ResponseMessage('Dashboard loaded successfully')
  @ApiOperation({ summary: 'Aggregated lead metrics for the admin overview' })
  @ApiOkResponse({ type: DashboardStatsDto })
  @ApiUnauthorizedResponse({ description: 'Missing, expired or invalid token' })
  getStats(): Promise<DashboardStatsDto> {
    return this.dashboardService.getStats();
  }
}
