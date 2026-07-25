import { ApiPropertyOptional } from '@nestjs/swagger';
import { LeadStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class QueryLeadsDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Case-insensitive partial match on name or email',
    example: 'ananya',
  })
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MaxLength(120, { message: 'Search term cannot exceed 120 characters' })
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ enum: LeadStatus, enumName: 'LeadStatus' })
  @IsEnum(LeadStatus, { message: 'Status must be one of: NEW, CONTACTED, CLOSED' })
  @IsOptional()
  status?: LeadStatus;
}
