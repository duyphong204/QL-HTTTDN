import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { CartService } from './cart.service';
import {
  CartItemInputDto,
  SyncCartDto,
  UpdateCartItemDto,
} from './dto/cart.dto';

const ALL_ROLES = [
  Role.ADMIN,
  Role.HR_MANAGER,
  Role.WAREHOUSE_MANAGER,
  Role.SALES_MANAGER,
  Role.EMPLOYEE,
  Role.CUSTOMER,
] as const;

@ApiTags('Sales - Cart')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @Roles(...ALL_ROLES)
  getCart(@Request() req: any) {
    return this.cartService.getCart(req.user.id);
  }

  @Post('items')
  @Roles(...ALL_ROLES)
  addItem(@Request() req: any, @Body() dto: CartItemInputDto) {
    return this.cartService.addItem(req.user.id, dto);
  }

  @Patch('items/:productId')
  @Roles(...ALL_ROLES)
  updateItem(
    @Request() req: any,
    @Param('productId') productId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(req.user.id, productId, dto);
  }

  @Delete('items/:productId')
  @Roles(...ALL_ROLES)
  removeItem(@Request() req: any, @Param('productId') productId: string) {
    return this.cartService.removeItem(req.user.id, productId);
  }

  @Post('clear')
  @Roles(...ALL_ROLES)
  clearCart(@Request() req: any) {
    return this.cartService.clearCart(req.user.id);
  }

  @Post('sync')
  @Roles(...ALL_ROLES)
  syncCart(@Request() req: any, @Body() dto: SyncCartDto) {
    return this.cartService.syncCart(req.user.id, dto);
  }
}
