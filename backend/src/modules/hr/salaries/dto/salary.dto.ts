import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export enum SalaryStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
}
export class CreateSalaryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  employeeId: string;
  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  @Max(12)
  month: number;
  @ApiProperty({ example: 2024 })
  @IsNumber()
  year: number;
  @ApiProperty({ description: 'Tiền thưởng' })
  @IsNumber()
  bonus: number;
  @ApiProperty({ description: 'Tiền phạt/khấu trừ' })
  @IsNumber()
  deduction: number;
  @ApiProperty({ enum: SalaryStatus, required: false })
  @IsOptional()
  @IsEnum(SalaryStatus)
  status?: SalaryStatus;
}
export class UpdateSalaryDto {
  @ApiProperty({ description: 'Tiền thưởng' })
  @IsOptional()
  @IsNumber()
  bonus?: number;
  @ApiProperty({ description: 'Tiền phạt/khấu trừ' })
  @IsOptional()
  @IsNumber()
  deduction?: number;
  @ApiProperty({ enum: SalaryStatus })
  @IsOptional()
  @IsEnum(SalaryStatus)
  status?: SalaryStatus;
}

export class QuerySalaryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  month?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  year?: number;

  @IsOptional()
  @IsString()
  employeeId?: string;

  @IsOptional()
  @IsEnum(SalaryStatus)
  status?: SalaryStatus;
}

export class CalculateAllSalaryDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  @Max(12)
  month: number;

  @ApiProperty({ example: 2026 })
  @IsNumber()
  year: number;
}
