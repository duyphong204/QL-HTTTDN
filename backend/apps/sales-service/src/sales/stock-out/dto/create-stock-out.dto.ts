import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  Min,
  IsOptional,
  IsString,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { StockOutType } from '@prisma/client';

class StockOutItemDto {
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsNumber()
  @Min(0)
  price!: number;
}

export class CreateStockOutDto {
  @IsOptional()
  @IsString()
  orderId?: string;

  @IsEnum(StockOutType)
  type!: StockOutType;

  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => StockOutItemDto)
  items!: StockOutItemDto[];
}
