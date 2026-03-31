import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { IsIn, IsInt, Min } from 'class-validator';

export class CreateSupplierDto {
  @ApiProperty({ example: 'Công ty ABC', description: 'Tên nhà cung cấp' })
  @IsString()
  @IsNotEmpty({ message: 'Tên không được để trống' })
  name: string;

  @ApiProperty({ example: '123 Đường Láng, Hà Nội', description: 'Địa chỉ' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ example: '0987654321', description: 'Số điện thoại' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 'contact@abc.com', description: 'Email liên hệ' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsOptional()
  email?: string;
}

export class UpdateSupplierDto {
  @ApiProperty({ example: 'Công ty ABC', description: 'Tên nhà cung cấp' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: '123 Đường Láng, Hà Nội', description: 'Địa chỉ' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ example: '0987654321', description: 'Số điện thoại' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 'contact@abc.com', description: 'Email liên hệ' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsOptional()
  email?: string;
}

export class QuerySupplierDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsIn(['name', 'email', 'phone'])
  sortBy?: 'name' | 'email' | 'phone' = 'name';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'asc';
}
