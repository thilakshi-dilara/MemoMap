import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsBoolean, IsDateString, IsLatitude, IsLongitude, IsOptional, IsString, IsUrl, Length, MaxLength } from 'class-validator';

export class CreateMemoryDto {
  @IsString() @Length(1, 200) title!: string;
  @IsOptional() @IsString() @Length(1, 10000) description?: string;
  @IsDateString() memoryDate!: string;
  @IsOptional() @IsString() @Length(1, 255) locationName?: string;
  @IsOptional() @Type(() => Number) @IsLatitude() latitude?: number;
  @IsOptional() @Type(() => Number) @IsLongitude() longitude?: number;
  @IsOptional() @IsBoolean() isFavorite?: boolean;
  @IsOptional() @IsArray() @ArrayMaxSize(10) @IsUrl({ protocols: ['http', 'https'], require_protocol: true, require_tld: false }, { each: true }) @MaxLength(2048, { each: true }) photoUrls?: string[];
}
