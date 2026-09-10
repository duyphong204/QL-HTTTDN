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
import { Role } from '@app/common/enums/role.enum';

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

