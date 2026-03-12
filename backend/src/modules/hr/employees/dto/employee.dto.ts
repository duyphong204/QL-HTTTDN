import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
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

  @IsString()
  @IsOptional()
  position?: string;

  @IsString()
  @IsOptional()
  department?: string;

  @IsDateString()
  @IsOptional()
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
export class CreateEmployeeDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  fullName: string;

  @IsString()
  phone?: string;

  @IsString()
  department?: string;

  @IsString()
  position?: string;

  @IsNumber()
  baseSalary: number;
}
