import {
  IsString,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @IsString({ message: 'ID sản phẩm phải là chuỗi' })
  productId!: string;

  @IsNumber({}, { message: 'Số lượng phải là số' })
  @Min(1, { message: 'Số lượng phải ít nhất 1' })
  quantity!: number;
}

export class CreateOrderDto {
  @IsString({ message: 'Họ tên phải là chuỗi' })
  fullName!: string;

  @IsString({ message: 'Số điện thoại phải là chuỗi' })
  phone!: string;

  @IsString({ message: 'Địa chỉ phải là chuỗi' })
  address!: string;

  @IsArray({ message: 'Danh sách sản phẩm phải là mảng' })
  @ValidateNested({
    each: true,
    message: 'Mỗi sản phẩm trong đơn hàng không hợp lệ',
  })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];
}
