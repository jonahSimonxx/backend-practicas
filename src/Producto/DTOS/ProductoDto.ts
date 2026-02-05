import { ApiProperty } from '@nestjs/swagger';

export class ProductoDto {
  @ApiProperty({ description: 'ID único del producto', example: 'PROD-001', required: true })
  id: string;

  @ApiProperty({ description: 'Código numérico', example: 1001, required: true })
  codigo: number;

  @ApiProperty({ description: 'Nombre del producto', example: 'Dipirona', required: true })
  nombre: string;

  @ApiProperty({ description: 'Descripción', example: 'Dipirona' })
  descripcion: string;

  @ApiProperty({ 
    description: 'Tipo de envase', 
    enum: ['primario', 'secundario', 'terciario'],
    example: 'primario',
    required: true
  })
  tipoEnvase: string;

  @ApiProperty({ 
    description: 'Tipo de producto', 
    enum: ['directo', 'indirecto'],
    example: 'directo',
    required: true
  })
  tipoProducto: string;

  @ApiProperty({ description: 'Unidad de medida', example: 'litros', required: true })
  unidadMedida: string;
}