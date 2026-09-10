import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@app/common/guards/jwt-auth.guard';
import { RolesGuard } from '@app/common';
import { Roles } from '@app/common';
import { Role } from '@app/common/enums/role.enum';
import {
  CreatePromotionDto,
  SetPromotionProductsDto,
  UpdatePromotionDto,
} from './dto/promotion.dto';
import { PromotionsService } from './promotions.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Get()
  @Roles(Role.ADMIN, Role.SALES_MANAGER)
  findAll() {
    return this.promotionsService.findAll();
  }

  @Post()
  @Roles(Role.ADMIN, Role.SALES_MANAGER)
  create(@Body() dto: CreatePromotionDto) {
    return this.promotionsService.create(dto);
  }
  
  @Patch(':id')
  @Roles(Role.ADMIN, Role.SALES_MANAGER)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePromotionDto,
  ) {
    return this.promotionsService.update(id, dto);
  }

  @Patch(':id/products')
  @Roles(Role.ADMIN, Role.SALES_MANAGER)
  setProducts(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SetPromotionProductsDto,
  ) {
    return this.promotionsService.setProducts(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SALES_MANAGER)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.promotionsService.remove(id);
  }
}


