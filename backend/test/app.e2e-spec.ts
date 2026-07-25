// Environment defaults are applied by test/support/test-env.ts (Jest `setupFiles`).
import type { INestApplication } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { AdminRole, BudgetRange, LeadStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { requestIdMiddleware } from '../src/common/middleware/request-id.middleware';
import { createValidationPipe } from '../src/common/pipes/validation-pipe.factory';
import { PrismaService } from '../src/prisma/prisma.service';
import { InMemoryPrismaService } from './support/in-memory-prisma.service';

const ADMIN_PASSWORD = 'Admin@12345';
const OWNER_PASSWORD = 'Owner@12345';

const validLead = {
  name: 'Sofia Bianchi',
  email: 'Sofia@casaverde.design',
  budget: BudgetRange.FROM_2L_TO_5L,
  message: 'Interior studio expanding to the UK, we need a bilingual site and an enquiry funnel.',
};

describe('LeadDesk Mini API (e2e)', () => {
  let app: INestApplication;
  let prisma: InMemoryPrismaService;
  let adminToken: string;
  let ownerToken: string;
  let seededLeadId: string;

  const http = () => request(app.getHttpServer());

  beforeAll(async () => {
    prisma = new InMemoryPrismaService();

    prisma.seedAdmin({
      id: randomUUID(),
      email: 'admin@leaddesk.dev',
      password: await bcrypt.hash(ADMIN_PASSWORD, 10),
      role: AdminRole.ADMIN,
    });
    prisma.seedAdmin({
      id: randomUUID(),
      email: 'owner@leaddesk.dev',
      password: await bcrypt.hash(OWNER_PASSWORD, 10),
      role: AdminRole.SUPER_ADMIN,
    });

    seededLeadId = prisma.seedLead({
      name: 'Ananya Sharma',
      email: 'ananya@northlightstudio.com',
      budget: BudgetRange.FROM_5L_TO_10L,
      message: 'We are rebuilding our booking flow and need a design partner for two quarters.',
      status: LeadStatus.NEW,
      createdAt: new Date('2026-01-02T09:00:00.000Z'),
    }).id;

    prisma.seedLead({
      name: 'Marcus Feld',
      email: 'marcus@feldandco.io',
      budget: BudgetRange.FROM_50K_TO_2L,
      message: 'Landing page refresh before our funding announcement in six weeks.',
      status: LeadStatus.CONTACTED,
      createdAt: new Date('2026-01-05T09:00:00.000Z'),
    });

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();

    app = moduleRef.createNestApplication();
    app.use(requestIdMiddleware);
    app.useGlobalPipes(createValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /health', () => {
    it('is public and reports the database as reachable', async () => {
      const response = await http().get('/health').expect(HttpStatus.OK);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('ok');
      expect(response.body.data.database).toBe('up');
    });
  });

  describe('POST /leads (public capture)', () => {
    it('rejects an empty submission with field-level errors', async () => {
      const response = await http().post('/leads').send({}).expect(HttpStatus.BAD_REQUEST);

      expect(response.body).toMatchObject({ success: false, message: 'Validation failed' });
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          'Name is required',
          'Enter a valid email address',
          'Select a valid budget range',
        ]),
      );
      expect(response.body).not.toHaveProperty('stack');
    });

    it('rejects an invalid email', async () => {
      const response = await http()
        .post('/leads')
        .send({ ...validLead, email: 'not-an-email' })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.errors).toContain('Enter a valid email address');
    });

    it('rejects an unknown budget range', async () => {
      const response = await http()
        .post('/leads')
        .send({ ...validLead, budget: 'A_LOT_OF_MONEY' })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.errors).toContain('Select a valid budget range');
    });

    it('rejects a message that is too short', async () => {
      const response = await http()
        .post('/leads')
        .send({ ...validLead, message: 'hi' })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.errors).toContain('Tell us a bit more — at least 20 characters');
    });

    it('rejects unexpected fields instead of silently ignoring them', async () => {
      const response = await http()
        .post('/leads')
        .send({ ...validLead, status: LeadStatus.CLOSED })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.success).toBe(false);
    });

    it('stores a valid lead as NEW and normalises the email', async () => {
      const response = await http().post('/leads').send(validLead).expect(HttpStatus.CREATED);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Thanks — your enquiry has been received',
      });
      expect(response.body.data).toMatchObject({
        name: validLead.name,
        email: validLead.email.toLowerCase(),
        status: LeadStatus.NEW,
      });
      expect(response.body.data.id).toEqual(expect.any(String));
    });
  });

  describe('Protected routes', () => {
    it('rejects an anonymous request to GET /leads', async () => {
      const response = await http().get('/leads').expect(HttpStatus.UNAUTHORIZED);

      expect(response.body).toMatchObject({ success: false, message: 'Authentication required' });
    });

    it('rejects a malformed bearer token', async () => {
      await http()
        .get('/leads')
        .set('Authorization', 'Bearer not.a.real.token')
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('rejects an anonymous request to GET /dashboard', async () => {
      await http().get('/dashboard').expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('POST /auth/login', () => {
    it('rejects invalid credentials without revealing which field was wrong', async () => {
      const response = await http()
        .post('/auth/login')
        .send({ email: 'admin@leaddesk.dev', password: 'WrongPassword1' })
        .expect(HttpStatus.UNAUTHORIZED);

      expect(response.body.message).toBe('Invalid email or password');
    });

    it('issues a token for valid credentials', async () => {
      const response = await http()
        .post('/auth/login')
        .send({ email: 'ADMIN@leaddesk.dev', password: ADMIN_PASSWORD })
        .expect(HttpStatus.OK);

      expect(response.body.data.accessToken).toEqual(expect.any(String));
      expect(response.body.data.admin).toMatchObject({
        email: 'admin@leaddesk.dev',
        role: AdminRole.ADMIN,
      });
      expect(response.body.data.admin).not.toHaveProperty('password');

      adminToken = response.body.data.accessToken as string;
    });

    it('signs in the super admin', async () => {
      const response = await http()
        .post('/auth/login')
        .send({ email: 'owner@leaddesk.dev', password: OWNER_PASSWORD })
        .expect(HttpStatus.OK);

      ownerToken = response.body.data.accessToken as string;
      expect(response.body.data.admin.role).toBe(AdminRole.SUPER_ADMIN);
    });

    it('validates the session with GET /auth/me', async () => {
      const response = await http()
        .get('/auth/me')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.data.email).toBe('admin@leaddesk.dev');
    });
  });

  describe('GET /leads', () => {
    it('returns leads newest first with pagination metadata', async () => {
      const response = await http()
        .get('/leads')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.OK);

      const { items, meta } = response.body.data;
      const timestamps = items.map((lead: { createdAt: string }) => Date.parse(lead.createdAt));

      expect(items.length).toBeGreaterThanOrEqual(3);
      expect([...timestamps].sort((a: number, b: number) => b - a)).toEqual(timestamps);
      expect(meta).toMatchObject({ page: 1, limit: 10, hasPreviousPage: false });
    });

    it('searches by name, ignoring case', async () => {
      const response = await http()
        .get('/leads')
        .query({ search: 'ANANYA' })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.data.items).toHaveLength(1);
      expect(response.body.data.items[0].name).toBe('Ananya Sharma');
    });

    it('searches by partial email', async () => {
      const response = await http()
        .get('/leads')
        .query({ search: 'feldandco' })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.data.items[0].email).toBe('marcus@feldandco.io');
    });

    it('returns an empty page for a search with no matches', async () => {
      const response = await http()
        .get('/leads')
        .query({ search: 'nobody-matches-this' })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.data.items).toEqual([]);
      expect(response.body.data.meta.total).toBe(0);
    });

    it('filters by status', async () => {
      const response = await http()
        .get('/leads')
        .query({ status: LeadStatus.CONTACTED })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.OK);

      expect(
        response.body.data.items.every((lead: { status: string }) => lead.status === 'CONTACTED'),
      ).toBe(true);
    });

    it('paginates', async () => {
      const response = await http()
        .get('/leads')
        .query({ page: 1, limit: 1 })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.data.items).toHaveLength(1);
      expect(response.body.data.meta.hasNextPage).toBe(true);
    });

    it('rejects a page size above the cap', async () => {
      const response = await http()
        .get('/leads')
        .query({ limit: 500 })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.errors).toContain('limit cannot exceed 100');
    });

    it('rejects an unknown status filter', async () => {
      await http()
        .get('/leads')
        .query({ status: 'ARCHIVED' })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('PATCH /leads/:id/status', () => {
    it('moves a lead from NEW to CONTACTED', async () => {
      const response = await http()
        .patch(`/leads/${seededLeadId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: LeadStatus.CONTACTED })
        .expect(HttpStatus.OK);

      expect(response.body.data.status).toBe(LeadStatus.CONTACTED);
      expect(response.body.message).toBe('Lead status updated');
    });

    it('is idempotent when re-applying the same status', async () => {
      const response = await http()
        .patch(`/leads/${seededLeadId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: LeadStatus.CONTACTED })
        .expect(HttpStatus.OK);

      expect(response.body.data.status).toBe(LeadStatus.CONTACTED);
    });

    it('rejects an unknown status value', async () => {
      const response = await http()
        .patch(`/leads/${seededLeadId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'ARCHIVED' })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.errors).toContain('Status must be one of: NEW, CONTACTED, CLOSED');
    });

    it('rejects a malformed id', async () => {
      await http()
        .patch('/leads/not-a-uuid/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: LeadStatus.CLOSED })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('returns 404 for a lead that does not exist', async () => {
      const response = await http()
        .patch(`/leads/${randomUUID()}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: LeadStatus.CLOSED })
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body.success).toBe(false);
    });

    it('requires authentication', async () => {
      await http()
        .patch(`/leads/${seededLeadId}/status`)
        .send({ status: LeadStatus.CLOSED })
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /dashboard', () => {
    it('returns aggregated statistics for the signed-in admin', async () => {
      const response = await http()
        .get('/dashboard')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.OK);

      const { data } = response.body;

      expect(data.totalLeads).toBeGreaterThanOrEqual(3);
      expect(data.byStatus).toEqual({
        new: expect.any(Number),
        contacted: expect.any(Number),
        closed: expect.any(Number),
      });
      expect(data.recentLeads.length).toBeLessThanOrEqual(5);
      expect(typeof data.conversionRate).toBe('number');
    });
  });

  describe('DELETE /leads/:id (role-restricted)', () => {
    it('forbids a standard admin', async () => {
      const response = await http()
        .delete(`/leads/${seededLeadId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.FORBIDDEN);

      expect(response.body.message).toBe('You do not have permission to perform this action');
    });

    it('allows a super admin', async () => {
      await http()
        .delete(`/leads/${seededLeadId}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(HttpStatus.OK);

      await http()
        .get(`/leads/${seededLeadId}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('Error handling', () => {
    it('returns the standard envelope for an unknown route', async () => {
      const response = await http().get('/does-not-exist').expect(HttpStatus.NOT_FOUND);

      expect(response.body).toMatchObject({ success: false, statusCode: 404 });
      expect(response.body.path).toBe('/does-not-exist');
      expect(response.body.requestId).toEqual(expect.any(String));
      expect(response.body.timestamp).toEqual(expect.any(String));
    });

    it('echoes a correlation id on every response', async () => {
      const response = await http().get('/health').expect(HttpStatus.OK);

      expect(response.headers['x-request-id']).toEqual(expect.any(String));
    });
  });

  // Kept last: it deliberately exhausts the login rate limit for this IP.
  describe('Rate limiting', () => {
    it('blocks repeated login attempts', async () => {
      const statuses: number[] = [];

      for (let attempt = 0; attempt < 8; attempt += 1) {
        const response = await http()
          .post('/auth/login')
          .send({ email: 'admin@leaddesk.dev', password: 'WrongPassword1' });
        statuses.push(response.status);
      }

      expect(statuses).toContain(HttpStatus.TOO_MANY_REQUESTS);
      expect(statuses.at(-1)).toBe(HttpStatus.TOO_MANY_REQUESTS);
    });
  });
});
