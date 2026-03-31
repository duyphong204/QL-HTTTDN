import {
  IsString,
  IsArray,
  ValidateNested,
  IsInt,
  Min,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @IsString()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @IsString()
  fullName: string;

  @IsString()
  phone: string;

  @IsString()
  address: string;

  @IsOptional()
  @IsEnum(['COD', 'BANK_TRANSFER'])
  paymentMethod?: 'COD' | 'BANK_TRANSFER';

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
