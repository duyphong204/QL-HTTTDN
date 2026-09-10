import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '@app/common/dto/pagination.dto';

export class QueryOrderDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  paymentStatus?: string;
}
