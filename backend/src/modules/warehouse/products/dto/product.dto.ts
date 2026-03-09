import { ApiProperty } from '@nestjs/swagger';
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

  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({ description: 'ID của danh mục sản phẩm' })
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({ description: 'ID của nhà cung cấp' })
  @IsString()
  @IsNotEmpty()
  supplierId: string;
}
