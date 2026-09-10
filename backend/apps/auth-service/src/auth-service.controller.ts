import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth/auth.service';
import { UsersService } from './users/users.service';

@Controller()
export class AuthServiceController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @MessagePattern({ cmd: 'auth.health' })
  healthCheck() {
    return {
      status: 'ok',
      service: 'auth-service',
      timestamp: new Date().toISOString(),
    };
  }

  @MessagePattern({ cmd: 'auth.login' })
  async login(@Payload() data: any) {
    return this.authService.login(data);
  }

  @MessagePattern({ cmd: 'auth.register' })
  async register(@Payload() data: any) {
    return this.authService.register(data);
  }

  @MessagePattern({ cmd: 'users.get_profile' })
  async getProfile(@Payload() userId: string) {
    return this.usersService.findOne(userId);
  }

  @MessagePattern({ cmd: 'users.find_all' })
  async findAllUsers(@Payload() query: any) {
    return this.usersService.findAll(query || {});
  }

  @MessagePattern({ cmd: 'users.find_one' })
  async findOneUser(@Payload() id: string) {
    return this.usersService.findOne(id);
  }

  @MessagePattern({ cmd: 'users.create' })
  async createUser(@Payload() dto: any) {
    return this.usersService.create(dto);
  }

  @MessagePattern({ cmd: 'users.update' })
  async updateUser(@Payload() payload: { id: string; data: any }) {
    return this.usersService.update(payload.id, payload.data);
  }

  @MessagePattern({ cmd: 'users.delete' })
  async deleteUser(@Payload() id: string) {
    return this.usersService.remove(id);
  }
}
