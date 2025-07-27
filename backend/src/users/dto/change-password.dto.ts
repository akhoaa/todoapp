import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'currentPassword123', description: 'Current password' })
  @IsString({ message: 'Current password must be a string' })
  @IsNotEmpty({ message: 'Current password is required' })
  @MaxLength(128, { message: 'Current password cannot exceed 128 characters' })
  currentPassword: string;

  @ApiProperty({ example: 'newPassword123', description: 'New password (minimum 6 characters, must contain letters and numbers)' })
  @IsString({ message: 'New password must be a string' })
  @IsNotEmpty({ message: 'New password is required' })
  @MinLength(6, { message: 'New password must be at least 6 characters long' })
  @MaxLength(128, { message: 'New password cannot exceed 128 characters' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)/, { message: 'New password must contain at least one letter and one number' })
  newPassword: string;
}
