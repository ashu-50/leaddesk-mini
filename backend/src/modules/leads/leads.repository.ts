import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Lead, LeadStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export interface FindLeadsOptions {
  where: Prisma.LeadWhereInput;
  skip: number;
  take: number;
}

export interface LeadStatusCount {
  status: LeadStatus;
  count: number;
}

/**
 * Every SQL-shaped concern for the Lead aggregate lives here.
 * The service layer above stays free of Prisma types it does not need.
 */
@Injectable()
export class LeadsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.LeadCreateInput): Promise<Lead> {
    return this.prisma.lead.create({ data });
  }

  /**
   * Rows and total are read in one transaction so the pagination meta can
   * never disagree with the page it describes.
   */
  findManyPaginated({ where, skip, take }: FindLeadsOptions): Promise<[Lead[], number]> {
    return this.prisma.$transaction([
      this.prisma.lead.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      this.prisma.lead.count({ where }),
    ]);
  }

  findRecent(take: number): Promise<Lead[]> {
    return this.prisma.lead.findMany({ take, orderBy: { createdAt: 'desc' } });
  }

  findById(id: string): Promise<Lead | null> {
    return this.prisma.lead.findUnique({ where: { id } });
  }

  updateStatus(id: string, status: LeadStatus): Promise<Lead> {
    return this.prisma.lead.update({ where: { id }, data: { status } });
  }

  delete(id: string): Promise<Lead> {
    return this.prisma.lead.delete({ where: { id } });
  }

  count(where: Prisma.LeadWhereInput = {}): Promise<number> {
    return this.prisma.lead.count({ where });
  }

  async countByStatus(): Promise<LeadStatusCount[]> {
    const grouped = await this.prisma.lead.groupBy({
      by: ['status'],
      _count: { _all: true },
    });

    return grouped.map((row) => ({ status: row.status, count: row._count._all }));
  }
}
