import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export enum SalaryStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
}
export class CreateSalaryDto {
  @IsString({ message: 'ID nhân viên phải là chuỗi' })
  @IsNotEmpty({ message: 'ID nhân viên không được để trống' })
  employeeId!: string;

  @IsNumber({}, { message: 'Tháng phải là số' })
  @Min(1, { message: 'Tháng phải từ 1 đến 12' })
  @Max(12, { message: 'Tháng phải từ 1 đến 12' })
  month!: number;

  @IsNumber({}, { message: 'Năm phải là số' })
  year!: number;

  @IsNumber({}, { message: 'Tiền thưởng phải là số' })
  @IsOptional()
  bonus?: number;

  @IsNumber({}, { message: 'Tiền khấu trừ phải là số' })
  @IsOptional()
  deduction?: number;

  @IsOptional()
  @IsEnum(SalaryStatus, { message: 'Trạng thái lương không hợp lệ' })
  status?: SalaryStatus;
}
export class UpdateSalaryDto {
  @IsOptional()
  @IsNumber({}, { message: 'Tiền thưởng phải là số' })
  bonus?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Tiền khấu trừ phải là số' })
  deduction?: number;

  @IsEnum(SalaryStatus, { message: 'Trạng thái lương không hợp lệ' })
  @IsOptional()
  status?: SalaryStatus;
}

export class QuerySalaryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Tháng phải là số' })
  month?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Năm phải là số' })
  year?: number;

  @IsOptional()
  @IsString({ message: 'ID nhân viên phải là chuỗi' })
  employeeId?: string;

  @IsOptional()
  @IsEnum(SalaryStatus, { message: 'Trạng thái lương không hợp lệ' })
  status?: SalaryStatus;
}

export class CalculateAllSalaryDto {
  @IsNumber({}, { message: 'Tháng phải là số' })
  @Min(1, { message: 'Tháng phải từ 1 đến 12' })
  @Max(12, { message: 'Tháng phải từ 1 đến 12' })
  month!: number;

  @IsNumber({}, { message: 'Năm phải là số' })
  year!: number;
}
