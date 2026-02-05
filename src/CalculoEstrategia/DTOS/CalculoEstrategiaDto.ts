import { ApiProperty } from '@nestjs/swagger';

export class CalculoEstrategiaDto {
  @ApiProperty({ description: 'ID único del cálculo', example: 'CALC-001', required: true })
  id: string;

  @ApiProperty({ description: 'ID de la estrategia', example: 'EST-001', required: true })
  estrategiaId: string;

  @ApiProperty({ description: 'Fecha del cálculo', example: '2024-01-15T10:30:00Z', required: true })
  fechaCalculo: Date;

  @ApiProperty({ 
    description: 'Resultado general', 
    enum: ['satisfactorio', 'parcial'],
    example: 'satisfactorio',
    required: true
  })
  resultadoGeneral: string;

  @ApiProperty({ description: 'Presupuesto utilizado', example: 35000.00, required: true })
  presupuestoUtilizado: number;

  @ApiProperty({ description: 'Presupuesto disponible', example: 15000.00, required: true })
  presupuestoDisponible: number;

  @ApiProperty({ description: 'Observaciones', example: 'Cálculo inicial' })
  observaciones: string;
}