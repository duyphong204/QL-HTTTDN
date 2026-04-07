import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Role } from 'src/common/enums/role.enum';

export class ProfileDto {
  @IsString({ message: 'Họ tên phải là chuỗi' })
  fullName!: string;
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString({ message: 'Họ tên phải là chuỗi' })
  fullName?: string;

  @IsOptional()
  @IsString({ message: 'Số điện thoại phải là chuỗi' })
  phone?: string;

  @IsOptional()
  @IsString({ message: 'Địa chỉ phải là chuỗi' })
  address?: string;

  @IsOptional()
  @IsString({ message: 'Avatar phải là chuỗi URL' })
  avatar?: string;

  @IsOptional()
  @Type(() => Date)
  dateOfBirth?: Date;
}

export class CreateUserDto {
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email!: string;

  @IsString({ message: 'Mật khẩu phải là chuỗi' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password!: string;

  @IsEnum(Role, { message: 'Quyền hạn không hợp lệ' })
  role!: Role;

  @ValidateNested({ message: 'Thông tin profile không hợp lệ' })
  @Type(() => ProfileDto)
  profile!: ProfileDto;
}

export class UpdateUserDto {
  @IsOptional()
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email?: string;

  @IsOptional()
  @IsEnum(Role, { message: 'Quyền hạn không hợp lệ' })
  role?: Role;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateProfileDto)
  profile?: UpdateProfileDto;
}

export class QueryUsersDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

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
  @IsIn(['createdAt', 'email', 'role'])
  sortBy?: 'createdAt' | 'email' | 'role' = 'createdAt';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';

  @IsOptional()
  @Type(() => Boolean)
  isActive?: boolean;
}
export class ChangeRoleDto {
  @IsEnum(Role, { message: 'Quyền hạn không hợp lệ' })
  role!: Role;
}
export class ToggleActiveDto {
  @Type(() => Boolean)
  isActive!: boolean;
}
