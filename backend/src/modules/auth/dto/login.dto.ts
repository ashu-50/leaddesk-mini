import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@leaddesk.dev', maxLength: 180 })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail({}, { message: 'Enter a valid email address' })
  @MaxLength(180, { message: 'Email cannot exceed 180 characters' })
  email: string;

  @ApiProperty({ example: 'Admin@12345', minLength: 8, maxLength: 72 })
  @IsString({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  // bcrypt silently truncates anything past 72 bytes — reject instead.
  @MaxLength(72, { message: 'Password cannot exceed 72 characters' })
  password: string;
}
