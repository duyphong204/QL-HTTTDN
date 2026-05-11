import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { MomoService } from './momo.service';

@Module({
  controllers: [PaymentsController],
  providers: [MomoService],
  exports: [MomoService],
})
export class PaymentsModule {}
