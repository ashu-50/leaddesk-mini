import { Module } from '@nestjs/common';
import { LeadsController } from './leads.controller';
import { LeadsRepository } from './leads.repository';
import { LeadsService } from './leads.service';

@Module({
  controllers: [LeadsController],
  providers: [LeadsService, LeadsRepository],
  // Exported so DashboardModule can reuse the aggregate's data access instead
  // of reaching into Prisma on its own.
  exports: [LeadsService, LeadsRepository],
})
export class LeadsModule {}
