import { StockOutStatus, StockOutType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

import { PaginationQueryDto } from '@app/common/dto/pagination.dto';

export class FindStockOutQueryDto extends PaginationQueryDto {
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
