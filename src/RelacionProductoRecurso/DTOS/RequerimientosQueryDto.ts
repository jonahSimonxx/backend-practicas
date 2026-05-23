import { IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class RequerimientosQueryDto {
  @ApiProperty({ description: 'Cantidad del producto', type: Number, required: true })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  cantidad: number;
}
