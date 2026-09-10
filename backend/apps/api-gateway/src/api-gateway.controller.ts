import { Controller, Get } from '@nestjs/common';

@Controller()
export class ApiGatewayController {
  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      service: 'api-gateway',
      timestamp: new Date().toISOString(),
    };
  }
}
