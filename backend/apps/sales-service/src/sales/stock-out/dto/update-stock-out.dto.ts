import {
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { StockOutType } from '@prisma/client';

class UpdateStockOutItemDto {
  @IsString()
  productId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsNumber()
  @Min(0)
  price!: number;
}

export class UpdateStockOutDto {
  @IsOptional()
  @IsString()
  orderId?: string;

  @IsOptional()
  @IsEnum(StockOutType)
  type?: StockOutType;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateStockOutItemDto)
  items?: UpdateStockOutItemDto[];
}
