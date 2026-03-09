import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
export class UpdateProfileDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  fullName?: string;
  @ApiProperty()
  @IsString()
  @IsOptional()
  phone?: string;
  @ApiProperty()
  @IsString()
  @IsOptional()
  address?: string;
  position?: string;
  department?: string;
  dateOfBirth?: string; 
}
export class UpdateEmployeeDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  department?: string;
  @ApiProperty()
  @IsString()
  @IsOptional()
  position?: string;
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  baseSalary?: number;
}
export class CreateEmployeeFromUserDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  department?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  position?: string;

  @ApiProperty({ example: 10000000 })
  @IsNumber()
  @Min(0)
  baseSalary: number;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  joinDate?: string;
}
