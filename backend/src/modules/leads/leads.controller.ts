import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AdminRole } from '@prisma/client';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../../common/decorators/public.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import type { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateLeadDto } from './dto/create-lead.dto';
import { LeadListResponseDto } from './dto/lead-list-response.dto';
import { QueryLeadsDto } from './dto/query-leads.dto';
import { UpdateLeadStatusDto } from './dto/update-lead-status.dto';
import { LeadEntity } from './entities/lead.entity';
import { PUBLIC_LEAD_RATE_LIMIT } from './leads.constants';
import { LeadsService } from './leads.service';

@ApiTags('Leads')
@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Public()
  @Throttle({ default: { ttl: PUBLIC_LEAD_RATE_LIMIT.ttl, limit: PUBLIC_LEAD_RATE_LIMIT.limit } })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Thanks — your enquiry has been received')
  @ApiOperation({ summary: 'Capture a lead from the public website' })
  @ApiCreatedResponse({ type: LeadEntity })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  create(@Body() createLeadDto: CreateLeadDto): Promise<LeadEntity> {
    return this.leadsService.create(createLeadDto);
  }

  @Get()
  @ApiBearerAuth()
  @ResponseMessage('Leads retrieved successfully')
  @ApiOperation({ summary: 'List leads, newest first, with search and pagination' })
  @ApiOkResponse({ type: LeadListResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing, expired or invalid token' })
  findAll(@Query() query: QueryLeadsDto): Promise<PaginatedResult<LeadEntity>> {
    return this.leadsService.findAll(query);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ResponseMessage('Lead retrieved successfully')
  @ApiOperation({ summary: 'Fetch a single lead' })
  @ApiOkResponse({ type: LeadEntity })
  @ApiNotFoundResponse({ description: 'Lead does not exist' })
  findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string): Promise<LeadEntity> {
    return this.leadsService.findOne(id);
  }

  @Patch(':id/status')
  @ApiBearerAuth()
  @ResponseMessage('Lead status updated')
  @ApiOperation({ summary: 'Move a lead along its lifecycle' })
  @ApiOkResponse({ type: LeadEntity })
  @ApiNotFoundResponse({ description: 'Lead does not exist' })
  @ApiBadRequestResponse({ description: 'Unknown status value' })
  updateStatus(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateLeadStatusDto: UpdateLeadStatusDto,
  ): Promise<LeadEntity> {
    return this.leadsService.updateStatus(id, updateLeadStatusDto);
  }

  @Delete(':id')
  @Roles(AdminRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ResponseMessage('Lead deleted')
  @ApiOperation({ summary: 'Permanently delete a lead (super admins only)' })
  @ApiOkResponse({ schema: { properties: { id: { type: 'string', format: 'uuid' } } } })
  @ApiForbiddenResponse({ description: 'Requires the SUPER_ADMIN role' })
  remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string): Promise<{ id: string }> {
    return this.leadsService.remove(id);
  }
}
