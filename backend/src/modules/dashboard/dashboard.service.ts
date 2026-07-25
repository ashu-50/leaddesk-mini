import { Injectable } from '@nestjs/common';
import { LeadStatus } from '@prisma/client';
import { LeadEntity } from '../leads/entities/lead.entity';
import { LeadsRepository } from '../leads/leads.repository';
import type { DashboardStatsDto } from './dto/dashboard-stats.dto';

const RECENT_LEADS_LIMIT = 5;

@Injectable()
export class DashboardService {
  constructor(private readonly leadsRepository: LeadsRepository) {}

  /**
   * All six figures are read concurrently — they are independent queries and
   * the dashboard is the most frequently refreshed screen in the product.
   */
  async getStats(): Promise<DashboardStatsDto> {
    const [statusCounts, leadsToday, leadsThisWeek, recentLeads] = await Promise.all([
      this.leadsRepository.countByStatus(),
      this.leadsRepository.count({ createdAt: { gte: startOfToday() } }),
      this.leadsRepository.count({ createdAt: { gte: daysAgo(7) } }),
      this.leadsRepository.findRecent(RECENT_LEADS_LIMIT),
    ]);

    const byStatus = {
      new: countFor(statusCounts, LeadStatus.NEW),
      contacted: countFor(statusCounts, LeadStatus.CONTACTED),
      closed: countFor(statusCounts, LeadStatus.CLOSED),
    };

    const totalLeads = byStatus.new + byStatus.contacted + byStatus.closed;

    return {
      totalLeads,
      byStatus,
      leadsToday,
      leadsThisWeek,
      conversionRate: totalLeads === 0 ? 0 : round((byStatus.closed / totalLeads) * 100),
      recentLeads: LeadEntity.fromModels(recentLeads),
    };
  }
}

function countFor(counts: { status: LeadStatus; count: number }[], status: LeadStatus): number {
  return counts.find((entry) => entry.status === status)?.count ?? 0;
}

function startOfToday(): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}
