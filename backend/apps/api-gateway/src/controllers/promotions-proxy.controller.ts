import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { SALES_SERVICE, Public } from '@app/common';
import { firstValueFrom } from 'rxjs';

@Controller('promotions')
export class PromotionsProxyController {
  constructor(
    @Inject(SALES_SERVICE) private readonly salesClient: ClientProxy,
  ) {}

  @Public()
  @Get()
  async getPromotions() {
    return firstValueFrom(
      this.salesClient.send({ cmd: 'promotions.find_all' }, {}),
    );
  }

  @Post()
  async createPromotion(@Body() dto: any) {
    return firstValueFrom(
      this.salesClient.send({ cmd: 'promotions.create' }, dto),
    );
  }

  @Patch(':id')
  async updatePromotion(@Param('id') id: string, @Body() dto: any) {
    return firstValueFrom(
      this.salesClient.send({ cmd: 'promotions.update' }, { id, data: dto }),
    );
  }

  @Delete(':id')
  async deletePromotion(@Param('id') id: string) {
    return firstValueFrom(
      this.salesClient.send({ cmd: 'promotions.delete' }, id),
    );
  }
}
