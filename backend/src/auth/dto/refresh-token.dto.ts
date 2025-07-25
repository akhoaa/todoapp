import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({ example: 'your_refresh_token_here', description: 'Refresh token' })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}