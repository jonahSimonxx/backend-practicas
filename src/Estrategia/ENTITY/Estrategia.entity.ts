import { Entity, PrimaryColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Demanda } from '../../Demanda/ENTITY/Demanda.entity';

@Entity('ESTRATEGIA') 
export class Estrategia {
  @PrimaryColumn({ type: 'varchar', length: 20 }) 
  id: string; 

  @Column({ name: 'NOMBRE', type: 'varchar', length: 50 })
  nombre: string;

  @Column({ name: 'DESCRIPCION', type: 'text', nullable: true })
  descripcion: string;

  @CreateDateColumn({ name: 'FECHA_CREACION' })
  fechaCreacion: Date;

  @Column({ name: 'PRESUPUESTO_MAXIMO', type: 'numeric', precision: 10, scale: 2 })
  presupuestoMaximo: number;

  @Column({
    name: 'ESTADO',
    type: 'varchar',
    length: 20,
    default: 'activo'
  })
  estado: string; 

  @Column({
    name: 'RESULTADO_CALCULO', 
    type: 'varchar',
    length: 20,
    nullable: true
  })
  resultadoCalculo: string; 

  // ========== RELACIONES ==========
  @OneToMany(() => Demanda, demanda => demanda.estrategia)
  demandas: Demanda[];
  
  isActiva(): boolean {
    return this.estado === 'activo';
  }
}