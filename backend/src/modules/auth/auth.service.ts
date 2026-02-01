import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Role } from 'src/common/enums/role.enum';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService
    ) { }

    async login(dto: LoginDto) {
        const user = await this.usersService.findByEmail(dto.email);

        if (user && await bcrypt.compare(dto.password, user.password)) {
            const payload = {
                email: user.email,
                sub: user.id,
                role: user.role
            };

            return {
                accessToken: await this.jwtService.sign(payload),
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    fullName: user.profile?.fullName
                }
            };
        }
        throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    async register(dto: RegisterDto) {
        const userExist = await this.usersService.findByEmail(dto.email);
        if (userExist) {
            throw new ConflictException('Email đã tồn tại trong hệ thống');
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const user = await this.usersService.create({
            email: dto.email,
            password: hashedPassword,
            role: Role.CUSTOMER, // Dùng Enum cực kỳ an toàn
            profile: {
                create: {
                    fullName: dto.fullName // Đã đồng nhất chữ N viết hoa
                }
            }
        });

        return {
            message: 'Đăng ký tài khoản thành công',
            userId: user.id
        };
    }
}
