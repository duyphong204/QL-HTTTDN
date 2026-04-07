import { Type } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { IsIn, IsInt, Min } from 'class-validator';

export class CreateSupplierDto {
  @IsString({ message: 'Tên nhà cung cấp phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên nhà cung cấp không được để trống' })
  name: string;

  @IsString({ message: 'Địa chỉ phải là chuỗi' })
  @IsOptional()
  address?: string;

  @IsString({ message: 'Số điện thoại phải là chuỗi' })
  @IsOptional()
  phone?: string;

  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsOptional()
  email?: string;
}

export class UpdateSupplierDto {
  @IsString({ message: 'Tên nhà cung cấp phải là chuỗi' })
  @IsOptional()
  name?: string;

  @IsString({ message: 'Địa chỉ phải là chuỗi' })
  @IsOptional()
  address?: string;

  @IsString({ message: 'Số điện thoại phải là chuỗi' })
  @IsOptional()
  phone?: string;

  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsOptional()
  email?: string;
}

export class QuerySupplierDto {
  @IsOptional()
  @IsString({ message: 'Từ khóa tìm kiếm phải là chuỗi' })
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Trang phải là số nguyên' })
  @Min(1, { message: 'Trang phải ít nhất 1' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Giới hạn phải là số nguyên' })
  @Min(1, { message: 'Giới hạn phải ít nhất 1' })
  limit?: number = 10;

  @IsOptional()
  @IsIn(['name', 'email', 'phone'], { message: 'Sắp xếp theo không hợp lệ' })
  sortBy?: 'name' | 'email' | 'phone' = 'name';

  @IsOptional()
  @IsIn(['asc', 'desc'], { message: 'Thứ tự sắp xếp không hợp lệ' })
  sortOrder?: 'asc' | 'desc' = 'asc';
}
