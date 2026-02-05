import { ApiProperty } from '@nestjs/swagger';

export class RelacionProductoRecursoDto {
  @ApiProperty({ description: 'ID único de la relación', example: 'REL-001', required: true })
  id: string;

  @ApiProperty({ description: 'ID del producto', example: 'PROD-001', required: true })
  productoId: string;

  @ApiProperty({ description: 'ID del recurso', example: 'REC-001', required: true })
  recursoId: string;

  @ApiProperty({ description: 'Cantidad requerida por unidad', example: 2.5, required: true })
  cantidadRequerida: number;

  @ApiProperty({ 
    description: 'Tipo de relación', 
    enum: ['consumo', 'producción'],
    example: 'consumo',
    required: true
  })
  tipoRelacion: string;
}