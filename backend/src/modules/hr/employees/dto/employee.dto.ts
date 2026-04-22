import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { Role } from 'src/common/enums/role.enum';

export class UpdateProfileDto {
  @IsString({ message: 'Họ tên phải là chuỗi' })
  @IsOptional()
  fullName?: string;

  @IsString({ message: 'Số điện thoại phải là chuỗi' })
  @IsOptional()
  phone?: string;

  @IsString({ message: 'Địa chỉ phải là chuỗi' })
  @IsOptional()
  address?: string;

  @IsString({ message: 'Avatar phải là chuỗi' })
  @IsOptional()
  avatar?: string;

  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;
}

// DTO dùng để HR cập nhật thông tin nhân sự (bao gồm role)
export class UpdateEmployeeDto {
  @IsString({ message: 'Phòng ban phải là chuỗi' })
  @IsOptional()
  department?: string;

  @IsString({ message: 'Chức vụ phải là chuỗi' })
  @IsOptional()
  position?: string;

  @IsNumber({}, { message: 'Lương cơ bản phải là số' })
  @IsOptional()
  baseSalary?: number;

  @IsEnum(Role, { message: 'Quyền hạn không hợp lệ' })
  @IsOptional()
  role?: Role;

  @IsDateString()
  @IsOptional()
  effectiveDate?: string;
}

// DTO dùng khi gán nhân viên cho user đã tồn tại (nếu có nhu cầu)
export class CreateEmployeeFromUserDto {
  @IsString({ message: 'Phòng ban phải là chuỗi' })
  @IsOptional()
  department?: string;

  @IsString({ message: 'Chức vụ phải là chuỗi' })
  @IsOptional()
  position?: string;

  @IsNumber({}, { message: 'Lương cơ bản phải là số' })
  @Min(0, { message: 'Lương cơ bản phải lớn hơn hoặc bằng 0' })
  baseSalary!: number;

  @IsDateString()
  @IsOptional()
  joinDate?: string;
}

export class CreateEmployeeDto {
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email!: string;

  @IsString({ message: 'Mật khẩu phải là chuỗi' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password!: string;

  @IsString({ message: 'Họ tên phải là chuỗi' })
  fullName!: string;
  @IsEnum(Role, { message: 'Quyền hạn không hợp lệ' })
  @IsOptional()
  role?: Role;

  @IsString({ message: 'Phòng ban phải là chuỗi' })
  @IsOptional()
  department?: string;

  @IsString({ message: 'Chức vụ phải là chuỗi' })
  @IsOptional()
  position?: string;

  @IsNumber({}, { message: 'Lương cơ bản phải là số' })
  @Min(0, { message: 'Lương cơ bản phải lớn hơn hoặc bằng 0' })
  baseSalary!: number;
}

export class QueryEmployeeDto {
  @IsOptional()
  @IsString({ message: 'Từ khóa tìm kiếm phải là chuỗi' })
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Trang phải là số' })
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Giới hạn phải là số' })
  limit?: number;

  @IsOptional()
  @IsString({ message: 'Sắp xếp theo phải là chuỗi' })
  sortBy?: string;

  @IsOptional()
  @IsString({ message: 'Thứ tự sắp xếp không hợp lệ' })
  sortOrder?: 'asc' | 'desc';

  @IsOptional()
  @IsString({ message: 'Phòng ban phải là chuỗi' })
  department?: string;

  @IsOptional()
  @IsString({ message: 'Chức vụ phải là chuỗi' })
  position?: string;

  @IsOptional()
  @Type(() => Boolean)
  isActive?: boolean;
}
