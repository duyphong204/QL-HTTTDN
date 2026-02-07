import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateSupplierDto {
    @ApiProperty({ example: 'Công ty ABC', description: 'Tên nhà cung cấp' })
    @IsString()
    @IsNotEmpty({ message: 'Tên không được để trống' })
    name: string;

    @ApiProperty({ example: '123 Đường Láng, Hà Nội', description: 'Địa chỉ' })
    @IsString()
    @IsOptional()
    address?: string;

    @ApiProperty({ example: '0987654321', description: 'Số điện thoại' })
    @IsString()
    @IsOptional()
    phone?: string;

    @ApiProperty({ example: 'contact@abc.com', description: 'Email liên hệ' })
    @IsEmail({}, { message: 'Email không hợp lệ' })
    @IsOptional()
    email?: string;
}

export class UpdateSupplierDto {
    @ApiProperty({ example: 'Công ty ABC', description: 'Tên nhà cung cấp' })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty({ example: '123 Đường Láng, Hà Nội', description: 'Địa chỉ' })
    @IsString()
    @IsOptional()
    address?: string;

    @ApiProperty({ example: '0987654321', description: 'Số điện thoại' })
    @IsString()
    @IsOptional()
    phone?: string;

    @ApiProperty({ example: 'contact@abc.com', description: 'Email liên hệ' })
    @IsEmail({}, { message: 'Email không hợp lệ' })
    @IsOptional()
    email?: string;
}
