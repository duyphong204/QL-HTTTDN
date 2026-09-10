import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PaymentsModule } from '../payments/payments.module';
import { RmqModule, RABBITMQ_SERVICE } from '@app/common';

@Module({
  imports: [
    PaymentsModule,
    RmqModule.register({ name: RABBITMQ_SERVICE }),
  ],
  providers: [OrdersService],
  controllers: [OrdersController],
  exports: [OrdersService],
})
export class OrderModule {}
