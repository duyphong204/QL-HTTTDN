import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Inject,
  Req,
  Res,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  AUTH_SERVICE,
  Public,
  CurrentUser,
  LoginDto,
  RegisterDto,
} from '@app/common';
import { firstValueFrom } from 'rxjs';
import type { Response, Request } from 'express';

@Controller()
export class AuthProxyController {
  constructor(@Inject(AUTH_SERVICE) private readonly authClient: ClientProxy) {}

  @Public()
  @Post('auth/login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await firstValueFrom(
      this.authClient.send({ cmd: 'auth.login' }, loginDto),
    );

    if (result?.refreshToken) {
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
    }

    return result;
  }

  @Public()
  @Post('auth/register')
  async register(@Body() registerDto: RegisterDto) {
    return firstValueFrom(
      this.authClient.send({ cmd: 'auth.register' }, registerDto),
    );
  }

  @Public()
  @Post('auth/refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken =
      req.cookies?.refreshToken || req.headers['x-refresh-token'];
    const result = await firstValueFrom(
      this.authClient.send({ cmd: 'auth.refresh' }, { refreshToken }),
    );

    if (result?.refreshToken) {
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
    }

    return result;
  }

  @Get('auth/profile')
  async getProfile(@CurrentUser('id') userId: string) {
    return firstValueFrom(
      this.authClient.send({ cmd: 'users.get_profile' }, userId),
    );
  }

  @Get('auth/me')
  async getMe(@CurrentUser('id') userId: string) {
    return firstValueFrom(
      this.authClient.send({ cmd: 'users.get_profile' }, userId),
    );
  }

  @Post('auth/logout')
  async logout(
    @CurrentUser('id') userId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    await firstValueFrom(this.authClient.send({ cmd: 'auth.logout' }, userId));
    res.clearCookie('refreshToken');
    return { message: 'Đăng xuất thành công' };
  }

  // Users management
  @Get('users')
  async getUsers(@Query() query: any) {
    return firstValueFrom(
      this.authClient.send({ cmd: 'users.find_all' }, query),
    );
  }

  @Get('users/:id')
  async getUserById(@Param('id') id: string) {
    return firstValueFrom(this.authClient.send({ cmd: 'users.find_one' }, id));
  }
}
