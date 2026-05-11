import {
  IsUUID,
  IsInt,
  Min,
  Max,
  IsArray,
  IsOptional,
  ValidateNested,
  IsEnum,
  IsNumber,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DetailType } from '@prisma/client';

export class SalaryDetailInput {
  @IsEnum(DetailType)
  type!: DetailType;

  @IsNumber()
  amount!: number;

  @IsString()
  @IsOptional()
  description?: string;
}
export class CalculateAllDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month!: number;

  @Type(() => Number)
  @IsInt()
  year!: number;
}
export class CalculateSalaryDto {
  @IsUUID()
  employeeId!: string;

  @IsInt()
  @Min(1)
  @Max(12)
  month!: number;

  @IsInt()
  year!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SalaryDetailInput)
  @IsOptional()
  details?: SalaryDetailInput[];
}
export class StatisticsQueryDto {
  @Type(() => Number)
  @IsInt()
  year!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;
}
