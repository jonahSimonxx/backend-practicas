import { ApiProperty } from '@nestjs/swagger';

export class EstrategiaDto {
  @ApiProperty({ description: 'ID de la estrategia', example: 'EST-001', required: true }) 
  id: string; 

  @ApiProperty({ description: 'Nombre de la estrategia', example: 'Estrategia Navidad 2024', required: true })
  nombre: string;

  @ApiProperty({ description: 'Descripción de la estrategia', example: 'Plan de producción para temporada navideña' })
  descripcion: string;

  @ApiProperty({ description: 'Fecha de creación', example: '2024-01-15T10:30:00Z', required: true })
  fechaCreacion: Date;

  @ApiProperty({ description: 'Presupuesto máximo', example: 50000.00, required: true })
  presupuestoMaximo: number;

  @ApiProperty({ description: 'Estado', enum: ['activo', 'inactivo'], example: 'activo', required: true })
  estado: string;

  @ApiProperty({ 
    description: 'Resultado del último cálculo', 
    enum: ['posible', 'imposible'],
    example: 'posible',
    required: true
  })
  resultadoCalculo: string | null;
}