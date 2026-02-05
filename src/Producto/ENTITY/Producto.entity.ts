import { Entity, PrimaryColumn, Column } from 'typeorm';
// import { Demanda } from '../../demandas/entities/demanda.entity'; // FUTURA RELACIÓN
// import { RelacionProductoRecurso } from '../../relaciones/entities/relacion-producto-recurso.entity'; // FUTURA RELACIÓN

@Entity('PRODUCTO')
export class Producto {
    @PrimaryColumn({ type: 'varchar', length: 50 })
    id: string;

    @Column({ name: 'CODIGO', type: 'numeric', precision: 10, scale: 2 })
    codigo: number;

    @Column({ name: 'NOMBRE', type: 'varchar', length: 50 })
    nombre: string;

    @Column({ name: 'DESCRIPCION', type: 'varchar', nullable: false, length: 180 })
    descripcion: string;

    @Column({
        name: 'TIPO_ENVASE',
        type: 'varchar',
        length: 50,
        nullable: false
    })
    tipoEnvase: string; 

    @Column({
        name: 'TIPO_PRODUCTO',
        type: 'varchar',
        length: 50,
        nullable: false
    })
    tipoProducto: string; 

    @Column({ name: 'UNIDAD_MEDIDA', type: 'varchar', length: 50, nullable: false })
    unidadMedida: string;

  // ========== RELACIONES FUTURAS ==========
  // @OneToMany(() => Demanda, demanda => demanda.producto)
  // demandas: Demanda[];
  
  // @OneToMany(() => RelacionProductoRecurso, relacion => relacion.producto)
  // relacionesRecursos: RelacionProductoRecurso[];
}