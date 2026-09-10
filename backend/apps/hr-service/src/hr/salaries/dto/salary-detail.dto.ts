import { IsEnum, IsNumber, IsString, IsOptional } from 'class-validator';
import { DetailType } from '@prisma/client';

export class AddSalaryDetailDto {
  @IsEnum(DetailType)
  type!: DetailType;

  @IsNumber()
  amount!: number;

  @IsString()
  @IsOptional()
  description?: string;
}
