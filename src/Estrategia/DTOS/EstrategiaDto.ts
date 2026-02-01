import { ApiProperty } from '@nestjs/swagger';

export class EstrategiaDto {
  @ApiProperty({ description: 'ID de la estrategia', example: 1 })
  id: number;

  @ApiProperty({ description: 'Nombre de la estrategia', example: 'Estrategia Navidad 2024' })
  nombre: string;

  @ApiProperty({ description: 'Descripción de la estrategia', example: 'Plan de producción para temporada navideña' })
  descripcion: string;

  @ApiProperty({ description: 'Fecha de creación', example: '2024-01-15T10:30:00Z' })
  fechaCreacion: Date;

  @ApiProperty({ description: 'Presupuesto máximo', example: 50000.00 })
  presupuestoMaximo: number;

  @ApiProperty({ description: 'Estado', enum: ['activa', 'inactiva', 'pendiente'], example: 'activa' })
  estado: string;

  @ApiProperty({ description: 'Resultado del último cálculo', enum: ['satisfacible', 'insatisfacible', 'parcial', null], example: 'satisfacible' })
  resultadoCalculo: string;

  @ApiProperty({ description: 'Cantidad total demandada', example: 1500 })
  totalDemandado?: number;

  @ApiProperty({ description: 'Cantidad de demandas asociadas', example: 5 })
  cantidadDemandas?: number;
}