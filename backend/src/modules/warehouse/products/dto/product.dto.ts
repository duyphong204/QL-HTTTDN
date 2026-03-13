import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'iPhone 15 Pro Max' })
  @IsString()
  @IsNotEmpty({ message: 'Tên sản phẩm không được để trống' })
  name: string;

  @ApiProperty({ example: 'Sản phẩm cao cấp từ Apple', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 25000000 })
  @IsNumber()
  @Min(0)
  price: number; // Giá bán

  @ApiProperty({ example: 22000000 })
  @IsNumber()
  @Min(0)
  costPrice: number; // Giá nhập

  @ApiProperty({ example: 50 })
  @IsNumber()
  @Min(0)
  stockQuantity: number; // Số lượng tồn kho

  @ApiProperty({ description: 'ID của danh mục sản phẩm' })
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({ description: 'ID của nhà cung cấp' })
  @IsString()
  @IsNotEmpty()
  supplierId: string;
}

export class UpdateProductDto {
  @ApiProperty({ example: 'iPhone 15 Pro Max' })
  @IsString()
  @IsNotEmpty({ message: 'Tên sản phẩm không được để trống' })
  name: string;

  @ApiProperty({ example: 'Sản phẩm cao cấp từ Apple', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 25000000 })
  @IsNumber()
  @Min(0)
  price: number; // Giá bán

  @ApiProperty({ example: 22000000 })
  @IsNumber()
  @Min(0)
  costPrice: number; // Giá nhập

  @ApiProperty({ example: 50 })
  @IsNumber()
  @Min(0)
  stockQuantity: number; // Số lượng tồn kho

  @ApiProperty({ description: 'ID của danh mục sản phẩm' })
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({ description: 'ID của nhà cung cấp' })
  @IsString()
  @IsNotEmpty()
  supplierId: string;
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
}
