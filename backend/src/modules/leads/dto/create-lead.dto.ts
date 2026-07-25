import { ApiProperty } from '@nestjs/swagger';
import { BudgetRange } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEmail, IsEnum, IsString, Matches, MaxLength, MinLength } from 'class-validator';

const trim = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

const trimLower = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

/**
 * Letters, marks, spaces and the punctuation that appears in real names.
 * Unicode-aware, so "Ananya Sharma", "O'Brien" and "अनन्या" all pass while
 * "<script>" and "asdf1234" do not.
 */
const NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M}\s'’.-]*$/u;

export const MESSAGE_MIN_LENGTH = 20;
export const MESSAGE_MAX_LENGTH = 2000;

export class CreateLeadDto {
  @ApiProperty({ example: 'Ananya Sharma', minLength: 2, maxLength: 120 })
  @Transform(trim)
  @IsString({ message: 'Name is required' })
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  @MaxLength(120, { message: 'Name cannot exceed 120 characters' })
  @Matches(NAME_PATTERN, { message: 'Name contains characters that are not allowed' })
  name: string;

  @ApiProperty({ example: 'ananya@northlightstudio.com', maxLength: 180 })
  @Transform(trimLower)
  @IsEmail({}, { message: 'Enter a valid email address' })
  @MaxLength(180, { message: 'Email cannot exceed 180 characters' })
  email: string;

  @ApiProperty({ enum: BudgetRange, enumName: 'BudgetRange', example: BudgetRange.FROM_2L_TO_5L })
  @IsEnum(BudgetRange, { message: 'Select a valid budget range' })
  budget: BudgetRange;

  @ApiProperty({
    example: 'We are rebuilding our booking flow and need a design partner for eight weeks.',
    minLength: MESSAGE_MIN_LENGTH,
    maxLength: MESSAGE_MAX_LENGTH,
  })
  @Transform(trim)
  @IsString({ message: 'Message is required' })
  @MinLength(MESSAGE_MIN_LENGTH, {
    message: `Tell us a bit more — at least ${MESSAGE_MIN_LENGTH} characters`,
  })
  @MaxLength(MESSAGE_MAX_LENGTH, {
    message: `Message cannot exceed ${MESSAGE_MAX_LENGTH} characters`,
  })
  message: string;
}
