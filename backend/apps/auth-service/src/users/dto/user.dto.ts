import { Exclude, Type } from 'class-transformer';
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
import { Role } from '@app/common/enums/role.enum';
import { PaginationQueryDto } from '@app/common/dto/pagination.dto';

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

  @ValidateNested({ message: 'Thông tin profile không hợp lệ' })
  @Type(() => ProfileDto)
  profile!: ProfileDto;
}

export class UpdateUserDto {
  @IsOptional()
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateProfileDto)
  profile?: UpdateProfileDto;
}

export class UserProfileResponseDto {
  id!: string;
  userId!: string;
  fullName!: string;
  phone?: string;
  address?: string;
  avatar?: string;
  dateOfBirth?: Date | null;
}

export class UserResponseDto {
  id!: string;
  email!: string;
  role!: Role;
  isActive!: boolean;
  deletedAt!: Date | null;
  createdAt!: Date;
  updatedAt!: Date;

  @Type(() => UserProfileResponseDto)
  profile?: UserProfileResponseDto | null;

  @Exclude()
  password?: string;

  @Exclude()
  refreshTokenHash?: string | null;

  constructor(partial: Partial<UserResponseDto> | Record<string, unknown>) {
    Object.assign(this, partial);
  }
}

export class QueryUsersDto extends PaginationQueryDto {
  @Type(() => String)
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(['createdAt', 'email'], {
    message: 'Trường sắp xếp không hợp lệ',
  })
  sortBy?: 'createdAt' | 'email' = 'createdAt';

  @IsOptional()
  @IsIn(['asc', 'desc'], { message: 'Hướng sắp xếp phải là asc hoặc desc' })
  sortOrder?: 'asc' | 'desc' = 'desc';

  @Type(() => Boolean)
  @IsOptional()
  isActive?: boolean;
}
export class ToggleActiveDto {
  @Type(() => Boolean)
  isActive!: boolean;
}
