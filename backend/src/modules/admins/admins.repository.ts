import { Injectable } from '@nestjs/common';
import type { Admin } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Data-access boundary for the Admin aggregate.
 * Services never touch PrismaService directly — this keeps persistence
 * details swappable and makes services trivially unit-testable.
 */
@Injectable()
export class AdminsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string): Promise<Admin | null> {
    return this.prisma.admin.findUnique({ where: { email: email.toLowerCase() } });
  }

  findById(id: string): Promise<Admin | null> {
    return this.prisma.admin.findUnique({ where: { id } });
  }

  count(): Promise<number> {
    return this.prisma.admin.count();
  }
}
