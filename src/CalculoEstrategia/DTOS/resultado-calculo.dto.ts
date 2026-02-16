import { ApiProperty } from '@nestjs/swagger';

export class InventarioDetalleDto {
  @ApiProperty()
  almacen: string;
  
  @ApiProperty()
  lote: string;
  
  @ApiProperty()
  fabricante: string;
  
  @ApiProperty()
  fechaFabricacion: Date;
  
  @ApiProperty()
  fechaCaducidad: Date;
  
  @ApiProperty()
  cantidad: number;
  
  @ApiProperty()
  unidadMedida: string;
}

export class ResultadoRecursoDto {
  @ApiProperty()
  recursoId: string;
  
  @ApiProperty()
  nombre: string;
  
  @ApiProperty()
  tipoRecurso: string;
  
  @ApiProperty()
  unidadMedida: string;
  
  @ApiProperty()
  tipoRelacion: string;
  
  @ApiProperty()
  cantidadRequerida: number;
  
  @ApiProperty()
  existenciaInventario: number;
  
  @ApiProperty()
  esSatisfacible: boolean;
  
  @ApiProperty()
  deficit?: number;
  
  @ApiProperty({ type: [InventarioDetalleDto] })
  inventarios: InventarioDetalleDto[];
}

export class ResultadoProductoDto {
  @ApiProperty()
  productoId: string;
  
  @ApiProperty()
  nombreProducto: string;
  
  @ApiProperty()
  demanda: number;
  
  @ApiProperty()
  esSatisfacible: boolean;
  
  @ApiProperty({ type: [ResultadoRecursoDto] })
  recursos: ResultadoRecursoDto[];
}

export class ResultadoCalculoDto {
  @ApiProperty()
  estrategiaId: string;
  
  @ApiProperty()
  nombreEstrategia: string;
  
  @ApiProperty()
  resultadoGeneral: string;
  
  @ApiProperty()
  presupuestoUtilizado: number;
  
  @ApiProperty()
  fechaCalculo: Date;
  
  @ApiProperty({ type: [ResultadoProductoDto] })
  productos: ResultadoProductoDto[];
}