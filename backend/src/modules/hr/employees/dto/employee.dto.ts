import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
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
    @ApiProperty({ description: 'ID của User muốn biến thành nhân viên' })
    @IsString()
    @IsNotEmpty()
    userId: string;
    @ApiProperty({ example: 'NV001' })
    @IsString()
    @IsNotEmpty()
    code: string;
    @ApiProperty()
    @IsString()
    department: string;
    @ApiProperty()
    @IsString()
    position: string;
    @ApiProperty()
    @IsNumber()
    baseSalary: number;
}