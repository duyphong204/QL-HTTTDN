import { IsEnum } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsEnum(['APPROVED', 'SHIPPING', 'COMPLETED', 'CANCELLED'])
  status: 'APPROVED' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED';
}
