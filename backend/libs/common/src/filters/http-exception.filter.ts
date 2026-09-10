import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Lỗi máy chủ nội bộ';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse: unknown = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null &&
        ('message' in exceptionResponse || 'error' in exceptionResponse)
      ) {
        const payload = exceptionResponse as {
          message?: unknown;
          error?: unknown;
        };
        const msg = payload.message;

        if (payload.error) {
          error = String(payload.error);
        }

        if (Array.isArray(msg)) {
          message = msg as string[];
        } else if (typeof msg === 'string') {
          message = msg;
        }
      }
    } else if (
      typeof exception === 'object' &&
      exception !== null &&
      ('statusCode' in exception || 'status' in exception)
    ) {
      const payload = exception as any;
      status =
        payload.statusCode ||
        payload.status ||
        HttpStatus.INTERNAL_SERVER_ERROR;
      message = payload.message || 'Lỗi máy chủ nội bộ';
      error = payload.error || payload.name || 'Internal Server Error';
    } else if (exception instanceof Error) {
      this.logger.error(
        `[Unhandled Exception] Path: ${request.url} | Message: ${exception.message}`,
        exception.stack,
      );
      error = exception.name;
      message =
        exception.message ||
        'Đã có lỗi hệ thống xảy ra, vui lòng liên hệ quản trị viên.';
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      error,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
