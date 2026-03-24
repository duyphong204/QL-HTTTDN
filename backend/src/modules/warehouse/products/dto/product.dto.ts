import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty({ example: 'iPhone 15' })
  @IsString()
  @IsNotEmpty({ message: 'Tên sản phẩm không được để trống' })
  name: string;

  @ApiProperty({ example: 'Sản phẩm cao cấp', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 25000000 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 22000000 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  costPrice: number;

  @ApiProperty({ example: 50 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  stockQuantity: number;

  @ApiProperty({ description: 'ID thư mục' })
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({ description: 'ID NCC' })
  @IsString()
  @IsNotEmpty()
  supplierId: string;
}

export class UpdateProductDto {
  @ApiProperty({ example: 'iPhone 15 Pro Max' })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Tên sản phẩm không được để trống' })
  name?: string;

  @ApiProperty({ example: 'Sản phẩm cao cấp từ Apple', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 25000000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price?: number; // Giá bán

  @ApiProperty({ example: 22000000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  costPrice?: number; // Giá nhập

  @ApiProperty({ example: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  stockQuantity?: number; // Số lượng tồn kho

  @ApiProperty({ description: 'ID của danh mục sản phẩm' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  categoryId?: string;

  @ApiProperty({ description: 'ID của nhà cung cấp' })
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
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @IsIn(['name', 'price', 'costPrice', 'stockQuantity'])
  sortBy?: 'name' | 'price' | 'costPrice' | 'stockQuantity' = 'name';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'asc';
}
