import { IsArray, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ProductBatchDto {
  @ApiProperty({ type: [String], description: 'Array of product UUIDs' })
  @IsArray()
  @IsUUID('4', { each: true })
  ids: string[];
}
