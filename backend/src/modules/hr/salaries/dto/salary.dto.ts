import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';
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
  @ApiProperty({ example: 'PAID/PENDING' })
  @IsString()
  status: string;
}
