import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { SalesServiceAppModule } from './sales-service.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AllRpcExceptionsFilter } from '@app/common';

async function bootstrap() {
  const logger = new Logger('SalesService');
  const port = Number(process.env.SALES_SERVICE_PORT) || 3004;

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    SalesServiceAppModule,
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
  logger.log(`🚀 Sales & Order Microservice TCP Listener running on port: ${port}`);
}
void bootstrap();
