import { randomUUID } from 'node:crypto';
import type { Admin, Lead, LeadStatus, Prisma } from '@prisma/client';

type LeadWhere = Prisma.LeadWhereInput;

interface FindManyArgs {
  where?: LeadWhere;
  skip?: number;
  take?: number;
  orderBy?: { createdAt?: 'asc' | 'desc' };
}

/**
 * A hand-rolled test double for `PrismaService`.
 *
 * It implements exactly the surface the repositories use, which lets the
 * end-to-end suite exercise the real HTTP stack — guards, pipes, filters,
 * interceptors — on any machine, with no database and no Docker.
 */
export class InMemoryPrismaService {
  private admins: Admin[] = [];
  private leads: Lead[] = [];

  readonly admin = {
    findUnique: ({ where }: { where: { id?: string; email?: string } }): Promise<Admin | null> =>
      Promise.resolve(
        this.admins.find(
          (admin) =>
            (where.id !== undefined && admin.id === where.id) ||
            (where.email !== undefined && admin.email === where.email),
        ) ?? null,
      ),
    count: (): Promise<number> => Promise.resolve(this.admins.length),
  };

  readonly lead = {
    create: ({ data }: { data: Prisma.LeadCreateInput }): Promise<Lead> => {
      const now = new Date();
      const lead: Lead = {
        id: randomUUID(),
        name: data.name,
        email: data.email,
        budget: data.budget,
        message: data.message,
        status: data.status ?? 'NEW',
        createdAt: data.createdAt ? new Date(data.createdAt) : now,
        updatedAt: data.updatedAt ? new Date(data.updatedAt) : now,
      };
      this.leads.push(lead);
      return Promise.resolve(lead);
    },

    findMany: ({ where, skip = 0, take, orderBy }: FindManyArgs = {}): Promise<Lead[]> => {
      const rows = this.leads
        .filter((lead) => matches(lead, where))
        .sort((a, b) =>
          orderBy?.createdAt === 'asc'
            ? a.createdAt.getTime() - b.createdAt.getTime()
            : b.createdAt.getTime() - a.createdAt.getTime(),
        );

      return Promise.resolve(take === undefined ? rows.slice(skip) : rows.slice(skip, skip + take));
    },

    count: ({ where }: { where?: LeadWhere } = {}): Promise<number> =>
      Promise.resolve(this.leads.filter((lead) => matches(lead, where)).length),

    findUnique: ({ where }: { where: { id: string } }): Promise<Lead | null> =>
      Promise.resolve(this.leads.find((lead) => lead.id === where.id) ?? null),

    update: ({
      where,
      data,
    }: {
      where: { id: string };
      data: { status?: LeadStatus };
    }): Promise<Lead> => {
      const lead = this.leads.find((entry) => entry.id === where.id);

      if (!lead) {
        return Promise.reject(new Error(`Lead ${where.id} not found`));
      }

      if (data.status) {
        lead.status = data.status;
      }
      lead.updatedAt = new Date();

      return Promise.resolve(lead);
    },

    delete: ({ where }: { where: { id: string } }): Promise<Lead> => {
      const index = this.leads.findIndex((lead) => lead.id === where.id);

      if (index === -1) {
        return Promise.reject(new Error(`Lead ${where.id} not found`));
      }

      const [removed] = this.leads.splice(index, 1);
      return Promise.resolve(removed);
    },

    groupBy: (): Promise<{ status: LeadStatus; _count: { _all: number } }[]> => {
      const counts = new Map<LeadStatus, number>();

      for (const lead of this.leads) {
        counts.set(lead.status, (counts.get(lead.status) ?? 0) + 1);
      }

      return Promise.resolve(
        [...counts.entries()].map(([status, count]) => ({ status, _count: { _all: count } })),
      );
    },
  };

  $transaction<T>(operations: Promise<T>[]): Promise<T[]> {
    return Promise.all(operations);
  }

  $connect(): Promise<void> {
    return Promise.resolve();
  }

  $disconnect(): Promise<void> {
    return Promise.resolve();
  }

  onModuleInit(): Promise<void> {
    return Promise.resolve();
  }

  onModuleDestroy(): Promise<void> {
    return Promise.resolve();
  }

  isHealthy(): Promise<boolean> {
    return Promise.resolve(true);
  }

  /* ── test helpers ──────────────────────────────────────────────────────── */

  seedAdmin(admin: Omit<Admin, 'createdAt' | 'updatedAt'>): Admin {
    const record: Admin = { ...admin, createdAt: new Date(), updatedAt: new Date() };
    this.admins.push(record);
    return record;
  }

  seedLead(lead: Partial<Lead> & Pick<Lead, 'name' | 'email' | 'budget' | 'message'>): Lead {
    const now = new Date();
    const record: Lead = {
      id: lead.id ?? randomUUID(),
      name: lead.name,
      email: lead.email,
      budget: lead.budget,
      message: lead.message,
      status: lead.status ?? 'NEW',
      createdAt: lead.createdAt ?? now,
      updatedAt: lead.updatedAt ?? now,
    };
    this.leads.push(record);
    return record;
  }

  reset(): void {
    this.admins = [];
    this.leads = [];
  }
}

function matches(lead: Lead, where?: LeadWhere): boolean {
  if (!where) {
    return true;
  }

  if (typeof where.status === 'string' && lead.status !== where.status) {
    return false;
  }

  const createdAt = where.createdAt as { gte?: Date } | undefined;
  if (createdAt?.gte && lead.createdAt < createdAt.gte) {
    return false;
  }

  const or = where.OR as
    { name?: { contains?: string }; email?: { contains?: string } }[] | undefined;

  if (Array.isArray(or) && or.length > 0) {
    const hit = or.some((condition) => {
      const nameTerm = condition.name?.contains;
      const emailTerm = condition.email?.contains;

      return (
        (nameTerm !== undefined && includesInsensitive(lead.name, nameTerm)) ||
        (emailTerm !== undefined && includesInsensitive(lead.email, emailTerm))
      );
    });

    if (!hit) {
      return false;
    }
  }

  return true;
}

function includesInsensitive(value: string, term: string): boolean {
  return value.toLowerCase().includes(term.toLowerCase());
}
