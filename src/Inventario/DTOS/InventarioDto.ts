import { ApiProperty } from '@nestjs/swagger';

export class InventarioDto {
  @ApiProperty({ description: 'ID único del inventario', example: 'INV-001', required: true })
  id: string;

  @ApiProperty({ description: 'ID del recurso', example: 'REC-001', required: true })
  recursoId: string;

  @ApiProperty({ description: 'ID del almacén', example: 'ALM-001', required: true })
  almacenId: string;

  @ApiProperty({ description: 'Número de lote', example: 1001, required: true })
  lote: number;

  @ApiProperty({ description: 'Nombre del fabricante', example: 'Fabricante XYZ', required: true })
  fabricante: string;

  @ApiProperty({ description: 'Fecha de fabricación', example: '2024-01-15', required: true })
  fechaFabricacion: Date;

  @ApiProperty({ description: 'Fecha de caducidad', example: '2025-01-15', required: true })
  fechaCaducidad: Date;

  @ApiProperty({ description: 'Cantidad disponible', example: 1000.50, required: true })
  cantidadDisponible: number;

  @ApiProperty({ description: 'Fecha de vigencia', example: '2025-01-15', required: false, nullable: true })
  fechaVigencia: Date | null;

  @ApiProperty({ description: 'Número de muestreo', example: 1234, required: true })
  numeroMuestreo: number;

  @ApiProperty({
    description: 'Estado',
    enum: ['disponible', 'reservado'],
    example: 'disponible',
    required: true,
  })
  estado: string;

  @ApiProperty({ description: 'Unidad de medida', example: 'mg', required: true })
  unidadMedida: string;

  @ApiProperty({ description: 'Área de almacenamiento dentro del almacén', example: 'Zona sur', required: true })
  areaAlmacenamiento: string;

}