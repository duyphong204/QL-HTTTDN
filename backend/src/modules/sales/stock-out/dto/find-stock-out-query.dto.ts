import { StockOutStatus, StockOutType } from '@prisma/client';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';

export class FindStockOutQueryDto {
  @IsOptional()
  @IsEnum(StockOutStatus)
  status?: StockOutStatus;

  @IsOptional()
  @IsEnum(StockOutType)
  type?: StockOutType;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;
}
