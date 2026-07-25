import { Module } from '@nestjs/common';
import { AdminsRepository } from './admins.repository';
import { AdminsService } from './admins.service';

@Module({
  providers: [AdminsService, AdminsRepository],
  exports: [AdminsService],
})
export class AdminsModule {}
