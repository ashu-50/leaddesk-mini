/* eslint-disable no-console -- the seed script reports its progress to the terminal. */
import { AdminRole, BudgetRange, LeadStatus, PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS ?? 12);

interface SeedAdmin {
  email: string;
  password: string;
  role: AdminRole;
}

const admins: SeedAdmin[] = [
  {
    email: process.env.SEED_SUPER_ADMIN_EMAIL ?? 'owner@leaddesk.dev',
    password: process.env.SEED_SUPER_ADMIN_PASSWORD ?? 'Owner@12345',
    role: AdminRole.SUPER_ADMIN,
  },
  {
    email: process.env.SEED_ADMIN_EMAIL ?? 'admin@leaddesk.dev',
    password: process.env.SEED_ADMIN_PASSWORD ?? 'Admin@12345',
    role: AdminRole.ADMIN,
  },
];

const sampleLeads = [
  {
    name: 'Ananya Sharma',
    email: 'ananya@northlightstudio.com',
    budget: BudgetRange.FROM_5L_TO_10L,
    message:
      'We are rebuilding our booking flow and need a design partner for the next two quarters. Roughly 14 screens plus a design system.',
    status: LeadStatus.CONTACTED,
    daysAgo: 1,
  },
  {
    name: 'Marcus Feld',
    email: 'marcus@feldandco.io',
    budget: BudgetRange.FROM_2L_TO_5L,
    message:
      'Looking for a landing page refresh before our Series A announcement in six weeks. Copy is ready, design is not.',
    status: LeadStatus.NEW,
    daysAgo: 2,
  },
  {
    name: 'Priya Raghunathan',
    email: 'priya@quilt.health',
    budget: BudgetRange.ABOVE_10L,
    message:
      'Health-tech dashboard, HIPAA constraints, ongoing engagement. We need someone who has shipped regulated products before.',
    status: LeadStatus.CLOSED,
    daysAgo: 6,
  },
  {
    name: 'Tom Okafor',
    email: 'tom@brightsidecoffee.co',
    budget: BudgetRange.FROM_50K_TO_2L,
    message:
      'Small independent coffee roaster. Need a Shopify storefront that does not look like every other Shopify storefront.',
    status: LeadStatus.NEW,
    daysAgo: 3,
  },
  {
    name: 'Lena Vasquez',
    email: 'lena@atlasfreight.com',
    budget: BudgetRange.FROM_5L_TO_10L,
    message:
      'Internal tooling for our dispatch team. Currently four spreadsheets and a WhatsApp group. Please help.',
    status: LeadStatus.CONTACTED,
    daysAgo: 4,
  },
  {
    name: 'Devon Wright',
    email: 'devon@runwaylabs.dev',
    budget: BudgetRange.UNDER_50K,
    message:
      'Just need a one-page portfolio for my consultancy. Small budget, quick turnaround, happy to use a template.',
    status: LeadStatus.CLOSED,
    daysAgo: 9,
  },
  {
    name: 'Sofia Bianchi',
    email: 'sofia@casaverde.design',
    budget: BudgetRange.FROM_2L_TO_5L,
    message:
      'Interior studio in Milan expanding to the UK. We want a bilingual site with a project archive and enquiry funnel.',
    status: LeadStatus.NEW,
    daysAgo: 0,
  },
  {
    name: 'Kabir Malhotra',
    email: 'kabir@stackfin.in',
    budget: BudgetRange.ABOVE_10L,
    message:
      'Fintech onboarding revamp. Six-month engagement, dedicated squad, KYC flows and a compliance-heavy admin console.',
    status: LeadStatus.CONTACTED,
    daysAgo: 5,
  },
];

function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(9, 30, 0, 0);
  return date;
}

async function seedAdmins(): Promise<void> {
  for (const admin of admins) {
    const password = await bcrypt.hash(admin.password, SALT_ROUNDS);
    await prisma.admin.upsert({
      where: { email: admin.email.toLowerCase() },
      update: { password, role: admin.role },
      create: { email: admin.email.toLowerCase(), password, role: admin.role },
    });
    console.log(`  ✓ admin ready: ${admin.email} (${admin.role})`);
  }
}

async function seedLeads(): Promise<void> {
  if (process.env.SEED_SAMPLE_LEADS === 'false') {
    console.log('  · sample leads skipped (SEED_SAMPLE_LEADS=false)');
    return;
  }

  const existing = await prisma.lead.count();
  if (existing > 0) {
    console.log(`  · leads table already has ${existing} rows — skipping sample leads`);
    return;
  }

  await prisma.lead.createMany({
    data: sampleLeads.map(({ daysAgo: age, ...lead }) => ({
      ...lead,
      createdAt: daysAgo(age),
      updatedAt: daysAgo(age),
    })),
  });
  console.log(`  ✓ inserted ${sampleLeads.length} sample leads`);
}

async function main(): Promise<void> {
  console.log('Seeding LeadDesk Mini…');
  await seedAdmins();
  await seedLeads();
  console.log('Seed complete.');
}

main()
  .catch((error: unknown) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
