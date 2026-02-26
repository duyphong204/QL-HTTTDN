import { Module } from '@nestjs/common';
import { CategoriesModule } from './categories/categories.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { ProductsModule } from './products/products.module';
import { StockInModule } from './stock-in/stock-in.module';

@Module({
  imports: [CategoriesModule, SuppliersModule, ProductsModule, StockInModule],
})
export class WarehouseModule {}
