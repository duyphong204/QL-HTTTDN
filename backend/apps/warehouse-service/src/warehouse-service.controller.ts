import { Controller } from '@nestjs/common';
import { MessagePattern, EventPattern, Payload } from '@nestjs/microservices';
import { ProductService } from './warehouse/products/products.service';
import { CategoryService } from './warehouse/categories/categories.service';
import { SuppliersService } from './warehouse/suppliers/suppliers.service';
import { StockInService } from './warehouse/stock-in/stock-in.service';

import {
  CreateProductDto,
  UpdateProductDto,
  QueryProductDto,
} from './warehouse/products/dto/product.dto';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
} from './warehouse/categories/dto/category.dto';
import {
  CreateSupplierDto,
  UpdateSupplierDto,
  QuerySupplierDto,
} from './warehouse/suppliers/dto/supplier.dto';
import {
  CreateStockInDto,
  UpdateStockInDto,
  QueryStockInDto,
} from './warehouse/stock-in/dto/stock-in.dto';

@Controller()
export class WarehouseServiceController {
  constructor(
    private readonly productService: ProductService,
    private readonly categoryService: CategoryService,
    private readonly suppliersService: SuppliersService,
    private readonly stockInService: StockInService,
  ) {}

  @MessagePattern({ cmd: 'warehouse.health' })
  healthCheck() {
    return {
      status: 'ok',
      service: 'warehouse-service',
      timestamp: new Date().toISOString(),
    };
  }

  // Products
  @MessagePattern({ cmd: 'products.find_all' })
  async findAllProducts(@Payload() query: QueryProductDto) {
    return this.productService.findAll(query || {});
  }

  @MessagePattern({ cmd: 'products.stats' })
  async getProductStats() {
    return this.productService.getStats();
  }

  @MessagePattern({ cmd: 'products.find_one' })
  async findOneProduct(@Payload() id: string) {
    return this.productService.findOne(id);
  }

  @MessagePattern({ cmd: 'products.create' })
  async createProduct(@Payload() dto: CreateProductDto) {
    return this.productService.create(dto);
  }

  @MessagePattern({ cmd: 'products.update' })
  async updateProduct(
    @Payload() payload: { id: string; data: UpdateProductDto },
  ) {
    return this.productService.update(payload.id, payload.data);
  }

  @MessagePattern({ cmd: 'products.delete' })
  async deleteProduct(@Payload() id: string) {
    return this.productService.remove(id);
  }

  // Categories
  @MessagePattern({ cmd: 'categories.find_all' })
  async findAllCategories() {
    return this.categoryService.findAll();
  }

  @MessagePattern({ cmd: 'categories.create' })
  async createCategory(@Payload() dto: CreateCategoryDto) {
    return this.categoryService.create(dto);
  }

  @MessagePattern({ cmd: 'categories.update' })
  async updateCategory(
    @Payload() payload: { id: string; data: UpdateCategoryDto },
  ) {
    return this.categoryService.update(payload.id, payload.data);
  }

  @MessagePattern({ cmd: 'categories.delete' })
  async deleteCategory(@Payload() id: string) {
    return this.categoryService.remove(payloadId(id));
  }

  // Suppliers
  @MessagePattern({ cmd: 'suppliers.find_all' })
  async findAllSuppliers(@Payload() query: QuerySupplierDto) {
    return this.suppliersService.findAll(query || {});
  }

  @MessagePattern({ cmd: 'suppliers.find_one' })
  async findOneSupplier(@Payload() id: string) {
    return this.suppliersService.findOne(id);
  }

  @MessagePattern({ cmd: 'suppliers.create' })
  async createSupplier(@Payload() dto: CreateSupplierDto) {
    return this.suppliersService.create(dto);
  }

  @MessagePattern({ cmd: 'suppliers.update' })
  async updateSupplier(
    @Payload() payload: { id: string; data: UpdateSupplierDto },
  ) {
    return this.suppliersService.update(payload.id, payload.data);
  }

  @MessagePattern({ cmd: 'suppliers.delete' })
  async deleteSupplier(@Payload() id: string) {
    return this.suppliersService.remove(id);
  }

  // StockIns
  @MessagePattern({ cmd: 'stock_ins.find_all' })
  async findAllStockIns(@Payload() query: QueryStockInDto) {
    return this.stockInService.findAll(query || {});
  }

  @MessagePattern({ cmd: 'stock_ins.find_one' })
  async findOneStockIn(@Payload() id: string) {
    return this.stockInService.findOne(id);
  }

  @MessagePattern({ cmd: 'stock_ins.create' })
  async createStockIn(@Payload() dto: CreateStockInDto & { userId: string }) {
    return this.stockInService.createStockIn(dto, dto?.userId || 'system');
  }

  @MessagePattern({ cmd: 'stock_ins.update' })
  async updateStockIn(
    @Payload() payload: { id: string; data: UpdateStockInDto },
  ) {
    return this.stockInService.updateStockIn(payload.id, payload.data);
  }

  @MessagePattern({ cmd: 'stock_ins.delete' })
  async deleteStockIn(@Payload() id: string) {
    return this.stockInService.removeStockIn(id);
  }

  @MessagePattern({ cmd: 'inventory.reserve_stock' })
  async reserveStock(
    @Payload() payload: { productId: string; quantity: number },
  ) {
    return {
      success: true,
      reservedQuantity: payload.quantity,
      productId: payload.productId,
    };
  }

  // Event Listeners from RabbitMQ
  @EventPattern('order.created')
  async handleOrderCreated(@Payload() order: any) {
    if (
      order.paymentMethod === 'COD' ||
      order.paymentMethod === 'BANK_TRANSFER'
    ) {
      await this.productService.deductStockForOrder(order);
    }
  }

  @EventPattern('order.cancelled')
  async handleOrderCancelled(
    @Payload() payload: { orderId: string; details: any[] },
  ) {
    await this.productService.restoreStockForOrder(payload.details);
  }
}

function payloadId(id: any): string {
  return typeof id === 'string' ? id : id?.id || String(id);
}
