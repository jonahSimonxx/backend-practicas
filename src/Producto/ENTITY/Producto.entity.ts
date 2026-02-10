import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { Demanda } from '../../Demanda/ENTITY/Demanda.entity';
import { RelacionProductoRecurso } from '../../RelacionProductoRecurso/ENTITY/RelacionProductoRecurso.entity';

@Entity('PRODUCTO')
export class Producto {
    @PrimaryColumn({ type: 'varchar', length: 20 })
    id: string;

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

    // ========== RELACIONES ==========
    @OneToMany(() => Demanda, demanda => demanda.producto)
    demandas: Demanda[];
  
    @OneToMany(() => RelacionProductoRecurso, relacion => relacion.producto)
    relacionesRecursos: RelacionProductoRecurso[];
}