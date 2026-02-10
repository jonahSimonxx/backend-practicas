import { ApiProperty } from '@nestjs/swagger';

class InventarioDetalleDto {
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

class ResultadoRecursoDto {
  @ApiProperty()
  recursoId: string;
  
  @ApiProperty()
  nombre: string;
  
  @ApiProperty()
  tipoRecurso: string;
  
  @ApiProperty()
  unidadMedida: string;
  
  @ApiProperty()
  criterioRelacion: string;
  
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

class ResultadoProductoDto {
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