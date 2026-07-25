import { ApiProperty } from '@nestjs/swagger';
import { BudgetRange, LeadStatus } from '@prisma/client';
import type { Lead } from '@prisma/client';

/**
 * The public shape of a lead.
 *
 * Persistence models are never returned directly: this class is the contract
 * the API promises, so a database column can be renamed without breaking
 * clients.
 */
export class LeadEntity {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Ananya Sharma' })
  name: string;

  @ApiProperty({ example: 'ananya@northlightstudio.com' })
  email: string;

  @ApiProperty({ enum: BudgetRange, enumName: 'BudgetRange' })
  budget: BudgetRange;

  @ApiProperty({ example: 'We are rebuilding our booking flow…' })
  message: string;

  @ApiProperty({ enum: LeadStatus, enumName: 'LeadStatus' })
  status: LeadStatus;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt: Date;

  static fromModel(lead: Lead): LeadEntity {
    return {
      id: lead.id,
      name: lead.name,
      email: lead.email,
      budget: lead.budget,
      message: lead.message,
      status: lead.status,
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt,
    };
  }

  static fromModels(leads: Lead[]): LeadEntity[] {
    return leads.map((lead) => LeadEntity.fromModel(lead));
  }
}
