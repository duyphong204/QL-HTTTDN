import {
  Catch,
  RpcExceptionFilter as NestRpcExceptionFilter,
  ArgumentsHost,
  Logger,
  HttpException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';

@Catch()
export class AllRpcExceptionsFilter implements NestRpcExceptionFilter {
  private readonly logger = new Logger(AllRpcExceptionsFilter.name);

  catch(exception: any, host: ArgumentsHost): Observable<any> {
    let errorResponse: any;

    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      errorResponse = {
        statusCode: exception.getStatus(),
        message:
          typeof res === 'object' && res !== null && 'message' in res
            ? (res as any).message
            : res,
        error: exception.name,
      };
    } else if (exception instanceof RpcException) {
      errorResponse = exception.getError();
    } else {
      errorResponse = {
        statusCode: 500,
        message: exception?.message || 'Internal Server Error',
        error: exception?.name || 'Error',
      };
    }

    this.logger.error(
      `[Microservice RPC Exception] ${JSON.stringify(errorResponse)}`,
    );
    return throwError(() => errorResponse);
  }
}
