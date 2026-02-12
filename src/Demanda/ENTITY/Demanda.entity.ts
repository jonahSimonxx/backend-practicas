import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Producto } from '../../Producto/ENTITY/Producto.entity';
import { Estrategia } from '../../Estrategia/ENTITY/Estrategia.entity';

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

  // ========== RELACIONES ==========
  @ManyToOne(() => Producto, producto => producto.demandas)
  @JoinColumn({ name: 'PRODUCTO_ID' })
  producto: Producto;
  
  @ManyToOne(() => Estrategia, estrategia => estrategia.demandas)
  @JoinColumn({ name: 'ESTRATEGIA_ID' })
  estrategia: Estrategia;
}