import { ApiProperty } from '@nestjs/swagger';

export class DetalleInventarioDto {
  @ApiProperty({ description: 'ID del inventario' })
  inventarioId: string;

  @ApiProperty({ description: 'ID del almacén' })
  almacenId: string;

  @ApiProperty({ description: 'Área de almacenamiento' })
  areaAlmacenamiento: string;

  @ApiProperty({ description: 'Número de muestreo' })
  numeroMuestreo: number;

  @ApiProperty({ description: 'Fabricante del producto' })
  fabricante: string;

  @ApiProperty({ description: 'Fecha de fabricación' })
  fechaFabricacion: Date;

  @ApiProperty({ description: 'Fecha de caducidad' })
  fechaCaducidad: Date;

  @ApiProperty({ description: 'Fecha de vigencia' })
  fechaVigencia: Date;

  @ApiProperty({ description: 'Número de lote' })
  lote: number;

  @ApiProperty({ description: 'Cantidad disponible' })
  cantidadDisponible: number;

  @ApiProperty({ description: 'Unidad de medida' })
  unidadMedida: string;

  @ApiProperty({ description: 'Estado del inventario (disponible, reservado, etc)' })
  estado: string;

  @ApiProperty({ description: 'Indica si el producto está caducado' })
  esCaducado: boolean;
}

export class ExistenciaRecursoDto {
  @ApiProperty({ description: 'ID del recurso' })
  recursoId: string;

  @ApiProperty({ description: 'Nombre del recurso' })
  nombreRecurso: string;

  @ApiProperty({ description: 'Tipo de recurso' })
  tipoRecurso: string;

  @ApiProperty({ description: 'Unidad de medida del recurso' })
  unidadMedida: string;

  @ApiProperty({ description: 'Cantidad total disponible en inventario' })
  cantidadTotalDisponible: number;

  @ApiProperty({ description: 'Cantidad total en inventario (incluyendo no disponibles)' })
  cantidadTotal: number;

  @ApiProperty({ description: 'Número de movimientos/registros en inventario' })
  numeroMovimientos: number;

  @ApiProperty({ type: [DetalleInventarioDto], description: 'Detalles de cada existencia en inventario' })
  existencias: DetalleInventarioDto[];
}
