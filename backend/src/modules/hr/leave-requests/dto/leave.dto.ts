import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsString } from 'class-validator';
export class CreateLeaveDto {
  @ApiProperty()
  @IsDateString()
  startDate: Date;
  @ApiProperty()
  @IsDateString()
  endDate: Date;
  @ApiProperty({ example: 'SICK/ANNUAL/MATERNITY' })
  @IsString()
  @IsNotEmpty()
  type: string;
  @ApiProperty()
  @IsString()
  reason: string;
}
