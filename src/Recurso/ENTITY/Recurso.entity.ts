import { Entity, PrimaryColumn, Column } from 'typeorm';
// import { RelacionProductoRecurso } from '../../relaciones/entities/relacion-producto-recurso.entity'; // FUTURA
// import { DetalleCalculoRecurso } from '../../calculos/entities/detalle-calculo-recurso.entity'; // FUTURA
// import { Inventario } from '../../inventario/entities/inventario.entity'; // FUTURA

@Entity('RECURSO')
export class Recurso {
  @PrimaryColumn({ type: 'varchar', length: 20 })
  id: string;

  @Column({ name: 'CODIGO', type: 'varchar', length: 20 })
  codigo: string;

  @Column({ name: 'NOMBRE', type: 'varchar', length: 50 })
  nombre: string;

  @Column({
    name: 'TIPO_RECURSO',
    type: 'varchar',
    length: 20
  })
  tipoRecurso: string; 

  @Column({ name: 'UNIDAD_MEDIDA', type: 'varchar', length: 50 })
  unidadMedida: string;

  @Column({ name: 'DESCRIPCION', type: 'text', nullable: true })
  descripcion: string;

  // ========== RELACIONES FUTURAS ==========
  // @OneToMany(() => RelacionProductoRecurso, relacion => relacion.recurso)
  // relacionesProductos: RelacionProductoRecurso[];
  
  // @OneToMany(() => DetalleCalculoRecurso, detalle => detalle.recurso)
  // detallesCalculo: DetalleCalculoRecurso[];
  
  // @OneToMany(() => Inventario, inventario => inventario.recurso)
  // inventarios: Inventario[];
}