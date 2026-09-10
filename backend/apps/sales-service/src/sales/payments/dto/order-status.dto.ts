import { IsNotEmpty, IsUUID } from 'class-validator';

export class OrderStatusQueryDto {
  @IsNotEmpty()
  @IsUUID()
  orderId: string;
}
