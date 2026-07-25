import { Test } from '@nestjs/testing';
import { BudgetRange, LeadStatus } from '@prisma/client';
import type { Lead } from '@prisma/client';
import { LeadsRepository } from '../leads/leads.repository';
import { DashboardService } from './dashboard.service';

const recentLead: Lead = {
  id: 'e1a1a3a1-0b3c-4a5d-8e6f-9a0b1c2d3e4f',
  name: 'Marcus Feld',
  email: 'marcus@feldandco.io',
  budget: BudgetRange.FROM_2L_TO_5L,
  message: 'Looking for a landing page refresh before our announcement.',
  status: LeadStatus.NEW,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('DashboardService', () => {
  let service: DashboardService;
  let repository: jest.Mocked<Pick<LeadsRepository, 'countByStatus' | 'count' | 'findRecent'>>;

  beforeEach(async () => {
    repository = {
      countByStatus: jest.fn(),
      count: jest.fn(),
      findRecent: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [DashboardService, { provide: LeadsRepository, useValue: repository }],
    }).compile();

    service = moduleRef.get(DashboardService);
  });

  it('aggregates counts and derives the conversion rate', async () => {
    repository.countByStatus.mockResolvedValue([
      { status: LeadStatus.NEW, count: 12 },
      { status: LeadStatus.CONTACTED, count: 7 },
      { status: LeadStatus.CLOSED, count: 4 },
    ]);
    repository.count.mockResolvedValueOnce(3).mockResolvedValueOnce(9);
    repository.findRecent.mockResolvedValue([recentLead]);

    const stats = await service.getStats();

    expect(stats.totalLeads).toBe(23);
    expect(stats.byStatus).toEqual({ new: 12, contacted: 7, closed: 4 });
    expect(stats.leadsToday).toBe(3);
    expect(stats.leadsThisWeek).toBe(9);
    expect(stats.conversionRate).toBe(17.4);
    expect(stats.recentLeads).toHaveLength(1);
  });

  it('reports zeroes for an empty pipeline instead of dividing by zero', async () => {
    repository.countByStatus.mockResolvedValue([]);
    repository.count.mockResolvedValue(0);
    repository.findRecent.mockResolvedValue([]);

    const stats = await service.getStats();

    expect(stats.totalLeads).toBe(0);
    expect(stats.conversionRate).toBe(0);
    expect(stats.recentLeads).toEqual([]);
  });
});
