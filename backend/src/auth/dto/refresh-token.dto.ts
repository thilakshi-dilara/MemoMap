import { IsString, Matches } from 'class-validator';

export class RefreshTokenDto {
  @IsString()
  @Matches(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/)
  refreshToken!: string;
}
