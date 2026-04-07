import { IsDateString, IsIn, IsNotEmpty, IsString } from 'class-validator';

export class CreateLeaveDto {
  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsIn(['SICK', 'ANNUAL', 'MATERNITY', 'RESIGNATION'], {
    message: 'Loại nghỉ phép không hợp lệ',
  })
  type!: string;

  @IsString({ message: 'Lý do phải là chuỗi' })
  @IsNotEmpty({ message: 'Lý do không được để trống' })
  reason!: string;
}

export class UpdateLeaveStatusDto {
  @IsIn(['APPROVED', 'REJECTED'], { message: 'Trạng thái không hợp lệ' })
  status!: string;
}
