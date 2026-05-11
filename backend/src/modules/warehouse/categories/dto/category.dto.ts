import { ApiProperty } from '@nestjs/swagger';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên danh mục không được để trống' })
  @MinLength(2, { message: 'Tên danh mục phải có ít nhất 2 ký tự' })
  name: string;
}

export class UpdateCategoryDto {
  @ApiPropertyOptional({ description: 'Tên danh mục' })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Tên danh mục không được để trống' })
  @MinLength(2, { message: 'Tên danh mục phải có ít nhất 2 ký tự' })
  name?: string;
}
