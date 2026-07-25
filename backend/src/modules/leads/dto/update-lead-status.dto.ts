import { ApiProperty } from '@nestjs/swagger';
import { LeadStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateLeadStatusDto {
  @ApiProperty({
    enum: LeadStatus,
    enumName: 'LeadStatus',
    description: 'Lifecycle stage: NEW → CONTACTED → CLOSED',
  })
  @IsEnum(LeadStatus, { message: 'Status must be one of: NEW, CONTACTED, CLOSED' })
  status: LeadStatus;
}
