import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsPositive,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class QueryStockInDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  month?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(2000)
  year?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 20;
}

export class StockInDetailDto {
  @IsUUID(undefined, { message: 'ID sản phẩm không hợp lệ' })
  productId!: string;

  @IsNumber({}, { message: 'Số lượng phải là số' })
  @IsPositive({ message: 'Số lượng phải lớn hơn 0' })
  quantity!: number;

  @IsNumber({}, { message: 'Giá nhập phải là số' })
  @IsPositive({ message: 'Giá nhập phải lớn hơn 0' })
  price!: number; // Giá nhập (historical cost price)
}

export class CreateStockInDto {
  @IsUUID(undefined, { message: 'ID nhà cung cấp không hợp lệ' })
  supplierId!: string;

  @IsArray({ message: 'Chi tiết nhập kho phải là mảng' })
  @ValidateNested({ each: true, message: 'Mỗi chi tiết nhập kho không hợp lệ' })
  @Type(() => StockInDetailDto)
  details!: StockInDetailDto[];
}

export class UpdateStockInDto {
  @IsOptional()
  @IsUUID(undefined, { message: 'ID nhà cung cấp không hợp lệ' })
  supplierId?: string;

  @IsOptional()
  @IsArray({ message: 'Chi tiết nhập kho phải là mảng' })
  @ValidateNested({ each: true, message: 'Mỗi chi tiết nhập kho không hợp lệ' })
  @Type(() => StockInDetailDto)
  details?: StockInDetailDto[];
}
