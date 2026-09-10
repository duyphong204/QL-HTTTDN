import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { WarehouseServiceAppModule } from './warehouse-service.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AllRpcExceptionsFilter } from '@app/common';

async function bootstrap() {
  const logger = new Logger('WarehouseService');
  const port = Number(process.env.WAREHOUSE_SERVICE_PORT) || 3003;

  const app = await NestFactory.create(WarehouseServiceAppModule);

  // 1. TCP Microservice for API Gateway
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port,
    },
  });

  // 2. RMQ Microservice for Events
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672'],
      queue: process.env.RABBITMQ_WAREHOUSE_QUEUE || 'warehouse_queue',
      noAck: false,
      persistent: true,
    },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  app.useGlobalFilters(new AllRpcExceptionsFilter());

  await app.startAllMicroservices();
  await app.listen(port + 100); // Dummy HTTP port for the hybrid app
  logger.log(
    `🚀 Warehouse & Inventory Microservice TCP Listener running on port: ${port}`,
  );
}
void bootstrap();
