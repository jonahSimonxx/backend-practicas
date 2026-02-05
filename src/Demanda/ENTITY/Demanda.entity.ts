import { Entity, PrimaryColumn, Column } from 'typeorm';
// import { Producto } from '../../productos/entities/producto.entity'; // FUTURA
// import { Estrategia } from '../../estrategias/entities/estrategia.entity'; // FUTURA

@Entity('DEMANDA')
export class Demanda {
  @PrimaryColumn({ type: 'varchar', length: 20 })
  id: string;

  @Column({ name: 'PRODUCTO_ID', type: 'varchar', length: 20 })
  productoId: string; 

  @Column({ name: 'ESTRATEGIA_ID', type: 'varchar', length: 20 })
  estrategiaId: string; 

  @Column({
    name: 'TIPO_DEMANDA',
    type: 'varchar',
    length: 50
  })
  tipoDemanda: string; 

  @Column({ name: 'CANTIDAD_REQUERIDA', type: 'numeric', precision: 10, scale: 2 })
  cantidadRequerida: number;

  @Column({
    name: 'PERIODO',
    type: 'varchar',
    length: 20
  })
  periodo: string; 

  // ========== RELACIONES FUTURAS ==========
  // @ManyToOne(() => Producto, producto => producto.demandas)
  // @JoinColumn({ name: 'PRODUCTO_ID' })
  // producto: Producto;
  
  // @ManyToOne(() => Estrategia, estrategia => estrategia.demandas)
  // @JoinColumn({ name: 'ESTRATEGIA_ID' })
  // estrategia: Estrategia;

  /*// Métodos de ayuda
  getDemandaAnualizada(): number {
    switch (this.periodo) {
      case 'mensual': return this.cantidadRequerida * 12;
      case 'trimestral': return this.cantidadRequerida * 4;
      case 'anual': return this.cantidadRequerida;
      default: return this.cantidadRequerida;
    }
  }

  isEstatica(): boolean {
    return this.tipoDemanda === 'estática';
  }*/
}