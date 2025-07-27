import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({ example: 'your_refresh_token_here', description: 'Refresh token' })
  @IsString({ message: 'Refresh token must be a string' })
  @IsNotEmpty({ message: 'Refresh token is required' })
  @MinLength(10, { message: 'Refresh token is too short' })
  @MaxLength(1000, { message: 'Refresh token is too long' })
  refreshToken: string;
}