import {
  ArrayMinSize,
  IsIn,
  IsString,
  IsArray,
  ValidateNested,
  IsInt,
  IsNotEmpty,
  Min,
  Matches,
  MinLength,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

class OrderItemDto {
  @IsUUID('4', { message: 'productId khong hop le' })
  @IsString()
  productId: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : value,
  )
  @IsNotEmpty({ message: 'fullName khong duoc de trong' })
  @IsString()
  @MinLength(2, { message: 'fullName phai co it nhat 2 ky tu' })
  @Matches(/^[A-Za-zÀ-ỹ\s]+$/, {
    message: 'fullName chi duoc chua chu cai va khoang trang',
  })
  fullName: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.replace(/[\s.-]/g, '') : value,
  )
  @IsNotEmpty({ message: 'phone khong duoc de trong' })
  @IsString()
  @Matches(/^(0[3|5|7|8|9])[0-9]{8}$/, {
    message: 'phone khong hop le',
  })
  phone: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : value,
  )
  @IsNotEmpty({ message: 'address khong duoc de trong' })
  @IsString()
  @MinLength(8, { message: 'address phai co it nhat 8 ky tu' })
  address: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.toUpperCase().trim() : value,
  )
  @IsOptional()
  @IsIn(['COD', 'BANK_TRANSFER'], {
    message: 'paymentMethod chi ho tro COD hoac BANK_TRANSFER',
  })
  paymentMethod?: 'COD' | 'BANK_TRANSFER';

  @IsArray()
  @ArrayMinSize(1, { message: 'items phai co it nhat 1 san pham' })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];
}
