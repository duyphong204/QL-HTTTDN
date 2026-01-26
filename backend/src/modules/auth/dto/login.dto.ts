import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
    @ApiProperty({ example: 'admin@gmail.com', description: 'Email của người dùng' })
    @IsEmail({}, { message: 'Email không đúng định dạng' })
    email: string;

    @ApiProperty({ example: '123456', description: 'Mật khẩu' })
    @IsString()
    @MinLength(6, { message: 'Mật khẩu phải từ 6 ký tự trở lên' })
    password: string;
}