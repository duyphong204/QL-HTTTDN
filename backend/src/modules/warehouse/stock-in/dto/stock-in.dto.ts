import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
class StockInDetailDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  productId: string;
  @ApiProperty()
  @IsNumber()
  @Min(1)
  quantity: number;
  @ApiProperty()
  @IsNumber()
  @Min(0)
  price: number; // Giá nhập tại thời điểm này
}
export class CreateStockInDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  supplierId: string;
  @ApiProperty({ type: [StockInDetailDto] })
  @IsArray()
  details: StockInDetailDto[];
}
