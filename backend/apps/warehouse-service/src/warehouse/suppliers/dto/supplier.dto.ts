import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsIn,
} from 'class-validator';
import { PaginationQueryDto } from '@app/common/dto/pagination.dto';

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

/** Query params cho danh sách nhà cung cấp */
export class QuerySupplierDto extends PaginationQueryDto {
  @IsOptional()
  @IsString({ message: 'Từ khóa tìm kiếm phải là chuỗi' })
  search?: string;

  @IsOptional()
  @IsIn(['name', 'email', 'phone'], { message: 'sortBy không hợp lệ' })
  sortBy?: 'name' | 'email' | 'phone' = 'name';

  @IsOptional()
  @IsIn(['asc', 'desc'], { message: 'sortOrder không hợp lệ' })
  sortOrder?: 'asc' | 'desc' = 'asc';
}
