import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { RelacionProductoRecurso } from '../../RelacionProductoRecurso/ENTITY/RelacionProductoRecurso.entity';
import { Inventario } from '../../Inventario/ENTITY/Inventario.entity';

@Entity('RECURSO')
export class Recurso {
  @PrimaryColumn({ type: 'varchar', length: 20 })
  id: string;

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

  @Column({ name: 'CRITERIO_RELACION', type: 'varchar', length: 50, nullable: true })
  criterioRelacion: string;

  // ========== RELACIONES ==========
  @OneToMany(() => RelacionProductoRecurso, relacion => relacion.recurso)
  relacionesProductos: RelacionProductoRecurso[];
  
  @OneToMany(() => Inventario, inventario => inventario.recurso)
  inventarios: Inventario[];
}