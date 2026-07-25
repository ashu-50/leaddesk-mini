import { NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { BudgetRange, LeadStatus } from '@prisma/client';
import type { Lead } from '@prisma/client';
import { LeadsRepository } from './leads.repository';
import { LeadsService } from './leads.service';

const LEAD_ID = 'b2d0c0a4-5f6a-4c1f-9a51-16f0d0f1f001';

const buildLead = (overrides: Partial<Lead> = {}): Lead => ({
  id: LEAD_ID,
  name: 'Ananya Sharma',
  email: 'ananya@northlightstudio.com',
  budget: BudgetRange.FROM_5L_TO_10L,
  message: 'We are rebuilding our booking flow and need a design partner.',
  status: LeadStatus.NEW,
  createdAt: new Date('2026-01-10T09:30:00.000Z'),
  updatedAt: new Date('2026-01-10T09:30:00.000Z'),
  ...overrides,
});

describe('LeadsService', () => {
  let service: LeadsService;
  // Every public method, not a hand-picked subset: if the service starts
  // calling a repository method the mock does not implement, this fails to
  // compile instead of throwing "not a function" at runtime.
  let repository: jest.Mocked<Pick<LeadsRepository, keyof LeadsRepository>>;

  beforeEach(async () => {
    repository = {
      create: jest.fn(),
      findManyPaginated: jest.fn(),
      findRecent: jest.fn(),
      findById: jest.fn(),
      updateStatus: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      countByStatus: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [LeadsService, { provide: LeadsRepository, useValue: repository }],
    }).compile();

    service = moduleRef.get(LeadsService);
  });

  describe('create', () => {
    it('persists the lead and returns the public entity', async () => {
      const lead = buildLead();
      repository.create.mockResolvedValue(lead);

      const result = await service.create({
        name: lead.name,
        email: lead.email,
        budget: lead.budget,
        message: lead.message,
      });

      expect(repository.create).toHaveBeenCalledWith({
        name: lead.name,
        email: lead.email,
        budget: lead.budget,
        message: lead.message,
      });
      expect(result.status).toBe(LeadStatus.NEW);
      expect(result.id).toBe(LEAD_ID);
    });
  });

  describe('findAll', () => {
    it('builds a case-insensitive search across name and email', async () => {
      repository.findManyPaginated.mockResolvedValue([[buildLead()], 1]);

      await service.findAll({ page: 1, limit: 10, skip: 0, search: 'ananya' });

      expect(repository.findManyPaginated).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: 'ananya', mode: 'insensitive' } },
            { email: { contains: 'ananya', mode: 'insensitive' } },
          ],
        },
        skip: 0,
        take: 10,
      });
    });

    it('filters by status when provided', async () => {
      repository.findManyPaginated.mockResolvedValue([[], 0]);

      await service.findAll({ page: 1, limit: 10, skip: 0, status: LeadStatus.CONTACTED });

      expect(repository.findManyPaginated).toHaveBeenCalledWith({
        where: { status: LeadStatus.CONTACTED },
        skip: 0,
        take: 10,
      });
    });

    it('returns accurate pagination metadata', async () => {
      repository.findManyPaginated.mockResolvedValue([[buildLead()], 25]);

      const result = await service.findAll({ page: 2, limit: 10, skip: 10 });

      expect(result.meta).toEqual({
        page: 2,
        limit: 10,
        total: 25,
        totalPages: 3,
        hasNextPage: true,
        hasPreviousPage: true,
      });
    });

    it('reports an empty result set without pages', async () => {
      repository.findManyPaginated.mockResolvedValue([[], 0]);

      const result = await service.findAll({ page: 1, limit: 10, skip: 0 });

      expect(result.items).toHaveLength(0);
      expect(result.meta.totalPages).toBe(0);
      expect(result.meta.hasNextPage).toBe(false);
    });
  });

  describe('updateStatus', () => {
    it('moves the lead to the requested status', async () => {
      repository.findById.mockResolvedValue(buildLead());
      repository.updateStatus.mockResolvedValue(buildLead({ status: LeadStatus.CONTACTED }));

      const result = await service.updateStatus(LEAD_ID, { status: LeadStatus.CONTACTED });

      expect(repository.updateStatus).toHaveBeenCalledWith(LEAD_ID, LeadStatus.CONTACTED);
      expect(result.status).toBe(LeadStatus.CONTACTED);
    });

    it('is idempotent when the status is unchanged', async () => {
      repository.findById.mockResolvedValue(buildLead({ status: LeadStatus.CLOSED }));

      const result = await service.updateStatus(LEAD_ID, { status: LeadStatus.CLOSED });

      expect(repository.updateStatus).not.toHaveBeenCalled();
      expect(result.status).toBe(LeadStatus.CLOSED);
    });

    it('lets a mis-click be walked back one step', async () => {
      repository.findById.mockResolvedValue(buildLead({ status: LeadStatus.CONTACTED }));
      repository.updateStatus.mockResolvedValue(buildLead({ status: LeadStatus.NEW }));

      const result = await service.updateStatus(LEAD_ID, { status: LeadStatus.NEW });

      expect(result.status).toBe(LeadStatus.NEW);
    });

    it('reopens a closed lead as contacted', async () => {
      repository.findById.mockResolvedValue(buildLead({ status: LeadStatus.CLOSED }));
      repository.updateStatus.mockResolvedValue(buildLead({ status: LeadStatus.CONTACTED }));

      const result = await service.updateStatus(LEAD_ID, { status: LeadStatus.CONTACTED });

      expect(result.status).toBe(LeadStatus.CONTACTED);
    });

    // Reopening as NEW would mean "nobody has replied yet", which is untrue
    // and would inflate every waiting-on-you figure on the dashboard.
    it('refuses to move a closed lead back to new', async () => {
      repository.findById.mockResolvedValue(buildLead({ status: LeadStatus.CLOSED }));

      await expect(
        service.updateStatus(LEAD_ID, { status: LeadStatus.NEW }),
      ).rejects.toBeInstanceOf(UnprocessableEntityException);

      expect(repository.updateStatus).not.toHaveBeenCalled();
    });

    it('throws when the lead does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.updateStatus(LEAD_ID, { status: LeadStatus.CONTACTED }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('remove', () => {
    it('throws when the lead does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.remove(LEAD_ID)).rejects.toBeInstanceOf(NotFoundException);
      expect(repository.delete).not.toHaveBeenCalled();
    });
  });
});
