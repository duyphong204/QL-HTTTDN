import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';

export enum ReportType {
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year',
}

export class ReportQueryDto {
  @IsEnum(ReportType)
  type!: ReportType;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  year!: number;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(4)
  quarter?: number;
}
