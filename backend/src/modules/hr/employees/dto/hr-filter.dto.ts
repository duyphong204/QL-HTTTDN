import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Role } from 'src/common/enums/role.enum';
import { PaginationQueryDto } from 'src/common/dto/pagination.dto';

export class ChangePositionDto {
  @IsEnum(Role, { message: 'Quyền hạn không hợp lệ' })
  @IsOptional()
  role?: Role;

  @IsString({ message: 'Chức vụ phải là chuỗi' })
  @IsOptional()
  position?: string;

  @IsString({ message: 'Phòng ban phải là chuỗi' })
  @IsOptional()
  department?: string;

  @IsNumber({}, { message: 'Lương cơ bản phải là số' })
  @Min(0, { message: 'Lương cơ bản phải lớn hơn hoặc bằng 0' })
  @IsOptional()
  baseSalary?: number;

  @IsDateString({}, { message: 'Ngày hiệu lực không hợp lệ' })
  effectiveDate!: string;

  @IsString()
  @IsOptional()
  note?: string;
}

export class UpdateEmployeeProfileByHrDto {
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

export class QueryEmployeeDto extends PaginationQueryDto {
  @IsOptional()
  @IsString({ message: 'Từ khóa tìm kiếm phải là chuỗi' })
  search?: string;

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
