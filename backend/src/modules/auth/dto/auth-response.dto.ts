import { ApiProperty } from '@nestjs/swagger';
import { AdminRole } from '@prisma/client';

export class AdminProfileDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'admin@leaddesk.dev' })
  email: string;

  @ApiProperty({ enum: AdminRole, enumName: 'AdminRole' })
  role: AdminRole;
}

export class LoginResponseDto {
  @ApiProperty({ description: 'Signed JWT access token' })
  accessToken: string;

  @ApiProperty({ example: 'Bearer' })
  tokenType: string;

  @ApiProperty({ example: 86_400, description: 'Token lifetime in seconds' })
  expiresIn: number;

  @ApiProperty({ type: AdminProfileDto })
  admin: AdminProfileDto;
}
