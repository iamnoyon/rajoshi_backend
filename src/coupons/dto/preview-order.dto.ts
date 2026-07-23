import {
  IsString,
  IsArray,
  ValidateNested,
  IsOptional,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class PreviewItemDto {
  @ApiProperty()
  @IsString()
  productId: string;

  @ApiProperty()
  @Type(() => Number)
  @Min(1)
  quantity: number;
}

export class PreviewOrderDto {
  @ApiProperty({ type: [PreviewItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PreviewItemDto)
  items: PreviewItemDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  couponCode?: string;
}
