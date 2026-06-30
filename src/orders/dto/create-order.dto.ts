import {
  IsString,
  IsArray,
  ValidateNested,
  IsOptional,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class OrderItemDto {
  @ApiProperty()
  @IsString()
  productId: string;

  @ApiProperty()
  @Type(() => Number)
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  couponCode?: string;

  @ApiProperty()
  @IsObject()
  shippingAddress: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  billingAddress?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  deliveryMethod?: string;

  @ApiProperty()
  @IsString()
  paymentMethod: string;
}
