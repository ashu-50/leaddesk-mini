import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from '../../../common/dto/pagination-meta.dto';
import { LeadEntity } from '../entities/lead.entity';

export class LeadListResponseDto {
  @ApiProperty({ type: [LeadEntity] })
  items: LeadEntity[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
