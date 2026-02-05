import { ApiProperty } from '@nestjs/swagger';

export class DemandaDto {
  @ApiProperty({ description: 'ID único de la demanda', example: 'DEM-001', required: true })
  id: string;

  @ApiProperty({ description: 'ID del producto', example: 'PROD-001', required: true })
  productoId: string;

  @ApiProperty({ description: 'ID de la estrategia', example: 'EST-001', required: true })
  estrategiaId: string;

  @ApiProperty({ 
    description: 'Tipo de demanda', 
    enum: ['estática', 'dinámica'],
    example: 'estática',
    required: true
  })
  tipoDemanda: string;

  @ApiProperty({ description: 'Cantidad requerida', example: 1000.50, required: true })
  cantidadRequerida: number;

  @ApiProperty({ 
    description: 'Periodo', 
    enum: ['mensual', 'trimestral', 'anual'],
    example: 'mensual',
    required: true
  })
  periodo: string;
}