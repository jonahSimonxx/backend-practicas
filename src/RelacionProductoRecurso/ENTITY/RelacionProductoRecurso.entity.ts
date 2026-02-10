import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Producto } from '../../Producto/ENTITY/Producto.entity';
import { Recurso } from '../../Recurso/ENTITY/Recurso.entity';

@Entity('RELACION_PRODUCTO_RECURSO')
export class RelacionProductoRecurso {
  @PrimaryColumn({ type: 'varchar', length: 20 })
  id: string;

  @Column({ name: 'PRODUCTO_ID', type: 'varchar', length: 20 })
  productoId: string; 

  @Column({ name: 'RECURSO_ID', type: 'varchar', length: 20 })
  recursoId: string; 

  @Column({ name: 'CANTIDAD_REQUERIDA', type: 'numeric', precision: 10, scale: 2 })
  cantidadRequerida: number;

  @Column({
    name: 'TIPO_RELACION',
    type: 'varchar',
    length: 20
  })
  tipoRelacion: string; 
  
  // ========== RELACIONES ==========
  @ManyToOne(() => Producto, producto => producto.relacionesRecursos)
  @JoinColumn({ name: 'PRODUCTO_ID' })
  producto: Producto;
  
  @ManyToOne(() => Recurso, recurso => recurso.relacionesProductos)
  @JoinColumn({ name: 'RECURSO_ID' })
  recurso: Recurso;

  // Métodos de ayuda
  isConsumo(): boolean {
    return this.tipoRelacion === 'consumo';
  }

  isProduccion(): boolean {
    return this.tipoRelacion === 'producción';
  }

  getRequerimientoTotalParaCantidad(cantidadProducto: number): number {
    return this.cantidadRequerida * cantidadProducto;
  }
}