import {
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { buildPaginationMeta } from '../../common/interfaces/paginated-result.interface';
import type { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import type { CreateLeadDto } from './dto/create-lead.dto';
import type { QueryLeadsDto } from './dto/query-leads.dto';
import type { UpdateLeadStatusDto } from './dto/update-lead-status.dto';
import { LeadEntity } from './entities/lead.entity';
import { LeadsRepository } from './leads.repository';
import { ALLOWED_STATUS_TRANSITIONS } from './leads.constants';

/**
 * All lead business rules live here — controllers only translate HTTP.
 */
@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(private readonly leadsRepository: LeadsRepository) {}

  async create(dto: CreateLeadDto): Promise<LeadEntity> {
    const lead = await this.leadsRepository.create({
      name: dto.name,
      email: dto.email,
      budget: dto.budget,
      message: dto.message,
    });

    this.logger.log(`Lead captured: ${lead.id} (${lead.email})`);

    return LeadEntity.fromModel(lead);
  }

  async findAll(query: QueryLeadsDto): Promise<PaginatedResult<LeadEntity>> {
    const where = this.buildWhere(query);
    const [leads, total] = await this.leadsRepository.findManyPaginated({
      where,
      skip: query.skip,
      take: query.limit,
    });

    return {
      items: LeadEntity.fromModels(leads),
      meta: buildPaginationMeta(total, query.page, query.limit),
    };
  }

  async findOne(id: string): Promise<LeadEntity> {
    const lead = await this.leadsRepository.findById(id);

    if (!lead) {
      throw new NotFoundException(`No lead found with id "${id}"`);
    }

    return LeadEntity.fromModel(lead);
  }

  /**
   * Moves a lead along its lifecycle (NEW → CONTACTED → CLOSED).
   * Re-applying the current status is a no-op rather than an error, which
   * keeps the endpoint idempotent for retries and double-clicks.
   */
  async updateStatus(id: string, dto: UpdateLeadStatusDto): Promise<LeadEntity> {
    const existing = await this.leadsRepository.findById(id);

    if (!existing) {
      throw new NotFoundException(`No lead found with id "${id}"`);
    }

    if (existing.status === dto.status) {
      return LeadEntity.fromModel(existing);
    }

    if (!ALLOWED_STATUS_TRANSITIONS[existing.status].includes(dto.status)) {
      throw new UnprocessableEntityException(
        `A lead cannot move from ${existing.status} to ${dto.status}. ` +
          `Reopen it as CONTACTED instead.`,
      );
    }

    const updated = await this.leadsRepository.updateStatus(id, dto.status);
    this.logger.log(`Lead ${id} moved ${existing.status} → ${updated.status}`);

    return LeadEntity.fromModel(updated);
  }

  async remove(id: string): Promise<{ id: string }> {
    const existing = await this.leadsRepository.findById(id);

    if (!existing) {
      throw new NotFoundException(`No lead found with id "${id}"`);
    }

    await this.leadsRepository.delete(id);
    this.logger.warn(`Lead ${id} deleted`);

    return { id };
  }

  /**
   * `mode: 'insensitive'` maps to PostgreSQL ILIKE, and Prisma always
   * parameterises the value — search input can never become SQL.
   */
  private buildWhere(query: QueryLeadsDto): Prisma.LeadWhereInput {
    const where: Prisma.LeadWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return where;
  }
}
