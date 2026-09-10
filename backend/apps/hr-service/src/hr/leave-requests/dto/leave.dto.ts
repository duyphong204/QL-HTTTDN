import {
  IsDateString,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { LeaveType } from '@prisma/client';
import { PaginationQueryDto } from '@app/common/dto/pagination.dto';

export class CreateLeaveDto {
  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsEnum(LeaveType, { message: 'Loại nghỉ phép không hợp lệ' })
  type!: LeaveType;

  @IsString({ message: 'Lý do phải là chuỗi' })
  @IsNotEmpty({ message: 'Lý do không được để trống' })
  reason!: string;
}

export class UpdateLeaveStatusDto {
  @IsIn(['APPROVED', 'REJECTED'], { message: 'Trạng thái không hợp lệ' })
  status!: string;

  @IsString()
  @IsOptional()
  rejectionReason?: string;
}

/** Query params cho danh sách đơn nghỉ phép – kế thừa phân trang chuẩn */
export class QueryLeaveRequestDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsEnum(LeaveType)
  type?: LeaveType;

  @IsOptional()
  @IsString()
  employeeId?: string;

  @IsOptional()
  @IsString()
  year?: string;

  @IsOptional()
  @IsString()
  month?: string;
}
