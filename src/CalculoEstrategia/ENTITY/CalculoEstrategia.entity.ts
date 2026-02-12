import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Estrategia } from '../../Estrategia/ENTITY/Estrategia.entity';
import { DetalleCalculoRecurso } from '../../DetalleCalculoRecurso/ENTITY/DetalleCalculoRecurso.entity';

@Entity('CALCULO_ESTRATEGIA') 
export class CalculoEstrategia {
  @PrimaryColumn({ type: 'varchar', length: 20 })
  id: string;

  @Column({ name: 'ESTRATEGIA_ID', type: 'varchar', length: 20 })
  estrategiaId: string;

  @Column({ name: 'FECHA_CALCULO', type: 'timestamp with time zone' })
  fechaCalculo: Date;

  @Column({
    name: 'RESULTADO_GENERAL',
    type: 'varchar',
    length: 50
  })
  resultadoGeneral: string; 

  @Column({ name: 'PRESUPUESTO_UTILIZADO', type: 'numeric', precision: 10, scale: 2 })
  presupuestoUtilizado: number;

  @Column({ name: 'PRESUPUESTO_DISPONIBLE', type: 'numeric', precision: 10, scale: 2 })
  presupuestoDisponible: number;

  @Column({ name: 'OBSERVACIONES', type: 'text', nullable: true })
  observaciones: string;

  // ========== RELACIONES ==========
  @ManyToOne(() => Estrategia, estrategia => estrategia.calculos)
  @JoinColumn({ name: 'ESTRATEGIA_ID' })
  estrategia: Estrategia;
  
  @OneToMany(() => DetalleCalculoRecurso, detalle => detalle.calculo)
  detallesRecursos: DetalleCalculoRecurso[];
}