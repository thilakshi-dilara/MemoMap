import { IsOptional, IsString, IsTimeZone, IsUrl, Length } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional() @IsString() @Length(2, 100)
  displayName?: string;

  @IsOptional() @IsUrl({ require_tld: false }) @Length(1, 2048)
  avatarUrl?: string | null;

  @IsOptional() @IsTimeZone()
  timezone?: string;
}
