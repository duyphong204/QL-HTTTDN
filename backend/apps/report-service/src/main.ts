import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { ReportServiceAppModule } from './report-service.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AllRpcExceptionsFilter } from '@app/common';

async function bootstrap() {
  const logger = new Logger('ReportService');
  const port = Number(process.env.REPORT_SERVICE_PORT) || 3005;

  const app = await NestFactory.create(ReportServiceAppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port,
    },
  });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672'],
      queue: process.env.RABBITMQ_REPORT_QUEUE || 'report_queue',
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
  await app.listen(port + 100);
  logger.log(`🚀 Report & Analytics Microservice TCP Listener running on port: ${port}`);
}
void bootstrap();
