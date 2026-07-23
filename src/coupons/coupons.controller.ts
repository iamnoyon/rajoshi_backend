import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CouponsService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { PreviewOrderDto } from './dto/preview-order.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { UserRole } from '../entities/user.entity';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('Coupons')
@Controller('coupons')
export class CouponsController {
  constructor(private couponsService: CouponsService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all coupons (Admin)' })
  findAll(@Query() query: PaginationDto) {
    return this.couponsService.findAll(query.page, query.limit);
  }

  @Public()
  @Get('available')
  @ApiOperation({ summary: 'Get available coupons for customers' })
  findAvailableCoupons() {
    return this.couponsService.findAvailableCoupons();
  }

  @Public()
  @Get('code/:code')
  @ApiOperation({ summary: 'Get coupon by code' })
  findByCode(@Param('code') code: string) {
    return this.couponsService.findByCode(code);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get coupon by ID (Admin)' })
  findOne(@Param('id') id: string) {
    return this.couponsService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create coupon (Admin)' })
  create(@Body() dto: CreateCouponDto) {
    return this.couponsService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update coupon (Admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateCouponDto) {
    return this.couponsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete coupon (Admin)' })
  remove(@Param('id') id: string) {
    return this.couponsService.remove(id);
  }

  @Public()
  @Post('preview')
  @ApiOperation({ summary: 'Preview order with coupon' })
  previewOrder(@Body() dto: PreviewOrderDto) {
    return this.couponsService.previewOrder(dto);
  }

  @Post('validate')
  @ApiOperation({ summary: 'Validate coupon' })
  validateCoupon(
    @Body('code') code: string,
    @Body('orderTotal') orderTotal: number,
  ) {
    return this.couponsService.validateCoupon(code, orderTotal);
  }
}
