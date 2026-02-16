import { ApiProperty } from '@nestjs/swagger';

export class DetalleCalculoRecursoDto {
  @ApiProperty({ description: 'ID único del detalle', example: 'DET-001', required: true })
  id: string;

  @ApiProperty({ description: 'ID del cálculo', example: 'CALC-001', required: true })
  calculoId: string;

  @ApiProperty({ description: 'ID del recurso', example: 'REC-001', required: true })
  recursoId: string;

  @ApiProperty({ description: 'Cantidad total requerida', example: 500.75, required: true })
  cantidadRequeridaTotal: number;

  @ApiProperty({ description: 'Cantidad total disponible', example: 450.25, required: true })
  cantidadDisponibleTotal: number;

  @ApiProperty({ description: 'Indica si se puede satisfacer', example: true, required: true })
  satisfacer: boolean;
}