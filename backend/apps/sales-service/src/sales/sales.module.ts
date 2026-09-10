import { Module } from '@nestjs/common';
import { OrderModule } from './orders/order.module';
import { PaymentsModule } from './payments/payments.module';
import { PromotionsModule } from './promotions/promotions.module';
import { CartModule } from './cart/cart.module';
import { StockOutModule } from './stock-out/stock-out.module';

@Module({
  imports: [
    OrderModule,
    PaymentsModule,
    PromotionsModule,
    CartModule,
    StockOutModule,
  ],
  exports: [
    OrderModule,
    PaymentsModule,
    PromotionsModule,
    CartModule,
    StockOutModule,
  ],
})
export class SalesModule {}
