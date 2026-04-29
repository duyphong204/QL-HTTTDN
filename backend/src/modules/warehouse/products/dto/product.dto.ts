import { Type } from 'class-transformer';
import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsString({ message: 'Tên sản phẩm phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên sản phẩm không được để trống' })
  name!: string;

  @IsString({ message: 'Mô tả phải là chuỗi' })
  @IsOptional()
  description?: string;

  @Type(() => Number)
  @IsNumber({}, { message: 'Giá bán phải là số' })
  @Min(0, { message: 'Giá bán phải lớn hơn hoặc bằng 0' })
  price!: number;

  @Type(() => Number)
  @IsNumber({}, { message: 'Giá gốc phải là số' })
  @Min(0, { message: 'Giá gốc phải lớn hơn hoặc bằng 0' })
  costPrice!: number;

  @Type(() => Number)
  @IsNumber({}, { message: 'Số lượng tồn kho phải là số' })
  @Min(0, { message: 'Số lượng tồn kho phải lớn hơn hoặc bằng 0' })
  stockQuantity!: number;

  @IsString({ message: 'ID thư mục phải là chuỗi' })
  @IsNotEmpty({ message: 'ID thư mục không được để trống' })
  categoryId!: string;

  @IsString({ message: 'ID nhà cung cấp phải là chuỗi' })
  @IsNotEmpty({ message: 'ID nhà cung cấp không được để trống' })
  supplierId!: string;
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Tên sản phẩm không được để trống' })
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price?: number; // Giá bán

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  costPrice?: number; // Giá nhập

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  stockQuantity?: number; // Số lượng tồn kho

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  categoryId?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  supplierId?: string;
}

export class QueryProductDto {
  @IsOptional()
  @IsString()
  search?: string;
  @IsOptional()
  @IsString()
  categoryId?: string;
  @IsOptional()
  @IsString()
  supplierId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @IsIn([
    'featured',
    'price-low',
    'price-high',
    'newest',
    'name',
    'price',
    'costPrice',
    'stockQuantity',
  ])
  sortBy?:
    | 'featured'
    | 'price-low'
    | 'price-high'
    | 'newest'
    | 'name'
    | 'price'
    | 'costPrice'
    | 'stockQuantity' = 'featured';

  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'asc';

  @IsOptional()
  @Type(() => Boolean)
  minStock?: boolean;
}
