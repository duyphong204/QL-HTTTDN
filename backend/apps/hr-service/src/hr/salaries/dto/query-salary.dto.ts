import { IsOptional, IsInt, IsEnum, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { SalaryStatus } from '@prisma/client';
import { PaginationQueryDto } from '@app/common/dto/pagination.dto';

/** Query params cho danh sách bảng lương */
export class QuerySalaryDto extends PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  year?: number;

  @IsOptional()
  @IsString()
  employeeId?: string;

  @IsOptional()
  @IsEnum(SalaryStatus)
  status?: SalaryStatus;

  @IsOptional()
  @IsString()
  search?: string;
}

