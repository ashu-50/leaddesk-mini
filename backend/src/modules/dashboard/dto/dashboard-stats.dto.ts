import { ApiProperty } from '@nestjs/swagger';
import { LeadEntity } from '../../leads/entities/lead.entity';

export class LeadStatusBreakdownDto {
  @ApiProperty({ example: 12 })
  new: number;

  @ApiProperty({ example: 7 })
  contacted: number;

  @ApiProperty({ example: 4 })
  closed: number;
}

export class DashboardStatsDto {
  @ApiProperty({ example: 23 })
  totalLeads: number;

  @ApiProperty({ type: LeadStatusBreakdownDto })
  byStatus: LeadStatusBreakdownDto;

  @ApiProperty({ example: 3, description: 'Leads captured since midnight' })
  leadsToday: number;

  @ApiProperty({ example: 9, description: 'Leads captured in the last 7 days' })
  leadsThisWeek: number;

  @ApiProperty({ example: 17.4, description: 'Percentage of leads that reached CLOSED' })
  conversionRate: number;

  @ApiProperty({ type: [LeadEntity], description: 'Five newest leads' })
  recentLeads: LeadEntity[];
}
