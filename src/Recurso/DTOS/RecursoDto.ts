import { ApiProperty } from '@nestjs/swagger';

export class RecursoDto {
  @ApiProperty({ description: 'ID único del recurso', example: 'REC-001', required: true })
  id: string;

  @ApiProperty({ description: 'Código del recurso', example: 'MP-001' })
  codigo: string;

  @ApiProperty({ description: 'Nombre del recurso', example: 'Ácido acético', required: true })
  nombre: string;

  @ApiProperty({ 
    description: 'Tipo de recurso', 
    enum: ['materia prima', 'insumo'],
    example: 'materia prima',
    required: true
  })
  tipoRecurso: string;

  @ApiProperty({ description: 'Unidad de medida', example: 'kilogramos', required: true })
  unidadMedida: string;

  @ApiProperty({ description: 'Descripción', example: 'Azúcar blanca refinada para uso alimentario' })
  descripcion: string;

  /*@ApiProperty({ 
    description: 'Cantidad total disponible en inventarios', 
    example: 150.5,
    required: false
  })
  cantidadTotalDisponible?: number;

  @ApiProperty({ 
    description: 'Cantidad de productos que usan este recurso', 
    example: 3,
    required: false
  })
  cantidadProductosRelacionados?: number;

  @ApiProperty({ 
    description: 'Cantidad de inventarios', 
    example: 2,
    required: false
  })
  cantidadInventarios?: number;*/
}