import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsIn, IsNotEmpty, IsString } from 'class-validator';

export class CreateLeaveDto {
  @ApiProperty()
  @IsDateString()
  startDate: string;

  @ApiProperty()
  @IsDateString()
  endDate: string;

  @ApiProperty({ example: 'SICK | ANNUAL | MATERNITY | RESIGNATION' })
  @IsIn(['SICK', 'ANNUAL', 'MATERNITY', 'RESIGNATION'])
  type: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  reason: string;
}

export class UpdateLeaveStatusDto {
  @IsIn(['APPROVED', 'REJECTED'])
  status: string;
}
