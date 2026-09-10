import { NestFactory, Reflector } from '@nestjs/core';
import { ApiGatewayModule } from './api-gateway.module';
import {
  BadRequestException,
  ClassSerializerInterceptor,
  Logger,
  ValidationPipe,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { HttpExceptionFilter, TransformInterceptor } from '@app/common';

async function bootstrap() {
  const logger = new Logger('APIGateway');
  const app = await NestFactory.create(ApiGatewayModule);

  // Security Middlewares
  app.use(helmet());
  app.enableCors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  });

  app.use(cookieParser());

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        return new BadRequestException(
          validationErrors.map((error) => ({
            [error.property]: Object.values(error.constraints || {})[0],
          })),
        );
      },
    }),
  );

  app.useGlobalInterceptors(
    new TransformInterceptor(),
    new ClassSerializerInterceptor(app.get(Reflector)),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  const port = process.env.GATEWAY_PORT || process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`🚀 API Gateway running on: http://localhost:${port}/api`);
}
void bootstrap();
