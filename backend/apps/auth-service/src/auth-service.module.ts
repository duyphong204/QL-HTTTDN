import { Module } from '@nestjs/common';
import { AuthServiceController } from './auth-service.controller';
import { PrismaModule } from '@app/common/prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule],
  controllers: [AuthServiceController],
  providers: [],
})
export class AuthServiceAppModule {}

