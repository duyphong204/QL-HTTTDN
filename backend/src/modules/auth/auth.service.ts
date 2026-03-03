import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Role } from 'src/common/enums/role.enum';
import { PrismaService } from 'src/prisma/prisma.service';
import { Response, Request } from 'express';
import { JWT_CONFIG, JwtPayload } from './constants/jwt.constants';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  private createPayload(
    userId: string,
    email: string,
    role: string,
  ): JwtPayload {
    return { id: userId, email, role };
  }

  private async generateTokens(payload: JwtPayload) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: JWT_CONFIG.ACCESS_TOKEN_SECRET,
        expiresIn: JWT_CONFIG.ACCESS_TOKEN_EXPIRY,
      }),
      this.jwtService.signAsync(payload, {
        secret: JWT_CONFIG.REFRESH_TOKEN_SECRET,
        expiresIn: JWT_CONFIG.REFRESH_TOKEN_EXPIRY,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async updateRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    const hash = await bcrypt.hash(refreshToken, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: hash },
    });
  }

  async register(dto: RegisterDto) {
    const exists = await this.usersService.findByEmail(dto.email);

    if (exists) {
      throw new ConflictException('Email đã tồn tại');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        role: Role.CUSTOMER,
      },
    });

    return { message: 'Đăng ký thành công' };
  }

  async login(dto: LoginDto, res: Response) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const payload = this.createPayload(user.id, user.email, user.role);

    const { accessToken, refreshToken } = await this.generateTokens(payload);

    await this.updateRefreshToken(user.id, refreshToken);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.profile?.fullName ?? null,
      },
    };
  }

  async refresh(req: Request, res: Response) {
    const cookies = req.cookies as { refreshToken?: string };
    const refreshToken = cookies.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token');
    }

    let payload: JwtPayload;

    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: JWT_CONFIG.REFRESH_TOKEN_SECRET,
      });
    } catch {
      throw new ForbiddenException('Invalid refresh token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.id },
    });

    if (!user || !user.refreshTokenHash) {
      throw new ForbiddenException('Access denied');
    }

    const isValid = await bcrypt.compare(refreshToken, user.refreshTokenHash);

    if (!isValid) {
      throw new ForbiddenException('Access denied');
    }

    const newPayload = this.createPayload(user.id, user.email, user.role);

    const tokens = await this.generateTokens(newPayload);

    await this.updateRefreshToken(user.id, tokens.refreshToken);

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { accessToken: tokens.accessToken };
  }

  async logout(userId: string, res: Response): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: null },
    });

    res.clearCookie('refreshToken');
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        profile: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}
