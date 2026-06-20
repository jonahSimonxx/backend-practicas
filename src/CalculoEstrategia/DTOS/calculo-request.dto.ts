import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class CalculoRequestDto {
  @ApiProperty({
    required: false,
    type: [String],
    description:
      'IDs de los almacenes específicos en los que se desea buscar inventario. ' +
      'Si se omite, se consideran todos los almacenes activos. ' +
      'Los almacenes inactivos se excluyen siempre, de forma implícita.',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  priorizarAlmacenes?: string[];
}
