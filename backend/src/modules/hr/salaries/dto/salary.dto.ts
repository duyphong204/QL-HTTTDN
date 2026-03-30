import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
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
  @ApiProperty({ enum: SalaryStatus })
  @IsEnum(SalaryStatus)
  status: SalaryStatus;
}
export class UpdateSalaryDto {
  @ApiProperty({ description: 'Tiền thưởng' })
  @IsNumber()
  bonus: number;
  @ApiProperty({ description: 'Tiền phạt/khấu trừ' })
  @IsNumber()
  deduction: number;
  @ApiProperty({ enum: SalaryStatus })
  @IsEnum(SalaryStatus)
  status: SalaryStatus;
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
