import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { CalculoEstrategia } from '../../CalculoEstrategia/ENTITY/CalculoEstrategia.entity';
import { Recurso } from '../../Recurso/ENTITY/Recurso.entity';
import { Producto } from '../../Producto/ENTITY/Producto.entity';

@Entity('DETALLE_CALCULO_RECURSO') 
export class DetalleCalculoRecurso {
  @PrimaryColumn({ type: 'varchar', length: 20 })
  id: string;

  @Column({ name: 'CALCULO_ID', type: 'varchar', length: 20 })
  calculoId: string; 

  @Column({ name: 'RECURSO_ID', type: 'varchar', length: 20 })
  recursoId: string; 

  @Column({ name: 'PRODUCTO_ID', type: 'varchar', length: 20, nullable: true })
  productoId: string;

  @Column({ name: 'CANTIDAD_REQUERIDA_TOTAL', type: 'numeric', precision: 10, scale: 2 })
  cantidadRequeridaTotal: number;

  @Column({ name: 'CANTIDAD_DISPONIBLE_TOTAL', type: 'numeric', precision: 10, scale: 2 })
  cantidadDisponibleTotal: number;

  @Column({ name: 'ES_SATISFACIBLE', type: 'boolean' })
  esSatisfacible: boolean;

  @Column({ name: 'DEFICIT', type: 'numeric', precision: 10, scale: 2, nullable: true })
  deficit: number;

  // ========== RELACIONES ==========
  @ManyToOne(() => CalculoEstrategia, calculo => calculo.detallesRecursos)
  @JoinColumn({ name: 'CALCULO_ID' })
  calculo: CalculoEstrategia;
  
  @ManyToOne(() => Recurso, recurso => recurso.detallesCalculo)
  @JoinColumn({ name: 'RECURSO_ID' })
  recurso: Recurso;

  @ManyToOne(() => Producto, producto => producto.detallesCalculo)
  @JoinColumn({ name: 'PRODUCTO_ID' })
  producto: Producto;
  
  // Métodos de ayuda
  getDiferencia(): number {
    return this.cantidadDisponibleTotal - this.cantidadRequeridaTotal;
  }
  
  isSatisfacible(): boolean {
    return this.cantidadDisponibleTotal >= this.cantidadRequeridaTotal;
  }

  getPorcentajeSatisfaccion(): number {
    if (this.cantidadRequeridaTotal === 0) return 100;
    return (this.cantidadDisponibleTotal / this.cantidadRequeridaTotal) * 100;
  }

  getDeficit(): number {
    const diferencia = this.getDiferencia();
    return diferencia < 0 ? Math.abs(diferencia) : 0;
  }
}