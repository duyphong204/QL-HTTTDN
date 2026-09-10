import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { HrServiceAppModule } from './hr-service.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AllRpcExceptionsFilter } from '@app/common';

async function bootstrap() {
  const logger = new Logger('HrService');
  const port = Number(process.env.HR_SERVICE_PORT) || 3002;

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    HrServiceAppModule,
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
  logger.log(`🚀 HR & Payroll Microservice TCP Listener running on port: ${port}`);
}
void bootstrap();
