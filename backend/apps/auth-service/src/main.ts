import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AuthServiceAppModule } from './auth-service.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AllRpcExceptionsFilter } from '@app/common';

async function bootstrap() {
  const logger = new Logger('AuthService');
  const port = Number(process.env.AUTH_SERVICE_PORT) || 3001;

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AuthServiceAppModule,
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port,
      },
    },
  );

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  app.useGlobalFilters(new AllRpcExceptionsFilter());

  await app.listen();
  logger.log(`🚀 Auth & User Microservice TCP Listener running on port: ${port}`);
}
void bootstrap();
