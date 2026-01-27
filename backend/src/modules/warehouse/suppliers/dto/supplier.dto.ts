import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateSupplierDto {
    @ApiProperty({ description: 'Tên nhà cung cấp' })
    @IsString()
    @IsNotEmpty({ message: 'Tên không được để trống' })
    name: string;

    @ApiProperty({ description: 'Địa chỉ' })
    @IsString()
    @IsOptional()
    @IsNotEmpty({ message: 'Địa chỉ không được để trống' })
    address?: string;

    @ApiProperty({ description: 'Số điện thoại' })
    @IsString()
    @IsOptional()
    @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
    phone?: string;

    @ApiProperty({ description: 'Email liên hệ' })
    @IsEmail({}, { message: 'Email không hợp lệ' })
    @IsOptional()
    @IsNotEmpty({ message: 'Email không được để trống' })
    email?: string;
}