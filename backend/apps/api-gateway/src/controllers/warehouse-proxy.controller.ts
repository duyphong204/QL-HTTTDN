import { Controller, Get, Post, Patch, Delete, Param, Query, Body, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { WAREHOUSE_SERVICE, Public } from '@app/common';
import { firstValueFrom } from 'rxjs';

@Controller()
export class WarehouseProxyController {
  constructor(
    @Inject(WAREHOUSE_SERVICE) private readonly warehouseClient: ClientProxy,
  ) {}

  // Products
  @Public()
  @Get('products')
  async getProducts(@Query() query: any) {
    return firstValueFrom(this.warehouseClient.send({ cmd: 'products.find_all' }, query));
  }

  @Public()
  @Get('products/stats')
  async getProductStats() {
    return firstValueFrom(this.warehouseClient.send({ cmd: 'products.stats' }, {}));
  }

  @Public()
  @Get('products/:id')
  async getProductById(@Param('id') id: string) {
    return firstValueFrom(this.warehouseClient.send({ cmd: 'products.find_one' }, id));
  }

  @Post('products')
  async createProduct(@Body() body: any) {
    return firstValueFrom(this.warehouseClient.send({ cmd: 'products.create' }, body));
  }

  @Patch('products/:id')
  async updateProduct(@Param('id') id: string, @Body() body: any) {
    return firstValueFrom(this.warehouseClient.send({ cmd: 'products.update' }, { id, data: body }));
  }

  @Delete('products/:id')
  async deleteProduct(@Param('id') id: string) {
    return firstValueFrom(this.warehouseClient.send({ cmd: 'products.delete' }, id));
  }

  // Categories
  @Public()
  @Get('categories')
  async getCategories() {
    return firstValueFrom(this.warehouseClient.send({ cmd: 'categories.find_all' }, {}));
  }

  @Post('categories')
  async createCategory(@Body() body: any) {
    return firstValueFrom(this.warehouseClient.send({ cmd: 'categories.create' }, body));
  }

  @Patch('categories/:id')
  async updateCategory(@Param('id') id: string, @Body() body: any) {
    return firstValueFrom(this.warehouseClient.send({ cmd: 'categories.update' }, { id, data: body }));
  }

  @Delete('categories/:id')
  async deleteCategory(@Param('id') id: string) {
    return firstValueFrom(this.warehouseClient.send({ cmd: 'categories.delete' }, id));
  }

  // Suppliers
  @Public()
  @Get('suppliers')
  async getSuppliers(@Query() query: any) {
    return firstValueFrom(this.warehouseClient.send({ cmd: 'suppliers.find_all' }, query));
  }

  @Public()
  @Get('suppliers/:id')
  async getSupplierById(@Param('id') id: string) {
    return firstValueFrom(this.warehouseClient.send({ cmd: 'suppliers.find_one' }, id));
  }

  @Post('suppliers')
  async createSupplier(@Body() body: any) {
    return firstValueFrom(this.warehouseClient.send({ cmd: 'suppliers.create' }, body));
  }

  @Patch('suppliers/:id')
  async updateSupplier(@Param('id') id: string, @Body() body: any) {
    return firstValueFrom(this.warehouseClient.send({ cmd: 'suppliers.update' }, { id, data: body }));
  }

  @Delete('suppliers/:id')
  async deleteSupplier(@Param('id') id: string) {
    return firstValueFrom(this.warehouseClient.send({ cmd: 'suppliers.delete' }, id));
  }

  // StockIns
  @Public()
  @Get('stock-ins')
  async getStockIns(@Query() query: any) {
    return firstValueFrom(this.warehouseClient.send({ cmd: 'stock_ins.find_all' }, query));
  }

  @Public()
  @Get('stock-ins/:id')
  async getStockInById(@Param('id') id: string) {
    return firstValueFrom(this.warehouseClient.send({ cmd: 'stock_ins.find_one' }, id));
  }

  @Post('stock-ins')
  async createStockIn(@Body() body: any) {
    return firstValueFrom(this.warehouseClient.send({ cmd: 'stock_ins.create' }, body));
  }

  @Patch('stock-ins/:id')
  async updateStockIn(@Param('id') id: string, @Body() body: any) {
    return firstValueFrom(this.warehouseClient.send({ cmd: 'stock_ins.update' }, { id, data: body }));
  }

  @Delete('stock-ins/:id')
  async deleteStockIn(@Param('id') id: string) {
    return firstValueFrom(this.warehouseClient.send({ cmd: 'stock_ins.delete' }, id));
  }
}
