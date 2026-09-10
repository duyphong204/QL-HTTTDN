import { IsDateString, IsOptional, IsString } from 'class-validator';

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
