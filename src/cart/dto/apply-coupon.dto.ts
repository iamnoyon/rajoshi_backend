import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ApplyCouponDto {
  @ApiProperty()
  @IsString()
  code: string;
}
