import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse: unknown = exception.getResponse();

    let message: string | string[] = exception.message || 'Lỗi không xác định';
    let error: string = HttpStatus[status] || 'Error';

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      ('message' in exceptionResponse || 'error' in exceptionResponse)
    ) {
      const payload = exceptionResponse as { 
        message?: unknown;
        error?: unknown };
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
