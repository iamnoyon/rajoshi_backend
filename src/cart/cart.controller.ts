import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { ApplyCouponDto } from './dto/apply-coupon.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Cart')
@ApiBearerAuth()
@Controller('cart')
export class CartController {
  constructor(private cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user cart' })
  getCart(@CurrentUser('id') userId: string) {
    return this.cartService.getCart(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Add item to cart' })
  addToCart(@CurrentUser('id') userId: string, @Body() dto: AddToCartDto) {
    return this.cartService.addToCart(userId, dto);
  }

  @Patch(':productId')
  @ApiOperation({ summary: 'Update cart item quantity' })
  updateCartItem(
    @CurrentUser('id') userId: string,
    @Param('productId') productId: string,
    @Body() dto: UpdateCartDto,
  ) {
    return this.cartService.updateCartItem(userId, productId, dto);
  }

  @Delete(':productId')
  @ApiOperation({ summary: 'Remove item from cart' })
  removeFromCart(
    @CurrentUser('id') userId: string,
    @Param('productId') productId: string,
  ) {
    return this.cartService.removeFromCart(userId, productId);
  }

  @Delete()
  @ApiOperation({ summary: 'Clear cart' })
  clearCart(@CurrentUser('id') userId: string) {
    return this.cartService.clearCart(userId);
  }

  @Post('apply-coupon')
  @ApiOperation({ summary: 'Apply coupon to cart' })
  applyCoupon(
    @CurrentUser('id') userId: string,
    @Body() dto: ApplyCouponDto,
  ) {
    return this.cartService.applyCoupon(userId, dto.code);
  }
}
