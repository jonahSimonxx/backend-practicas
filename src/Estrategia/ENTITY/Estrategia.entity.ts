import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
//import { Demanda } from '../../demandas/entities/demanda.entity';
//import { CalculoEstrategia } from '../../calculos/entities/calculo-estrategia.entity';

@Entity('estrategias')
export class Estrategia {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'presupuesto_maximo' })
  presupuestoMaximo: number;

  @Column({ 
    type: 'varchar', 
    length: 50, 
    default: 'activa',
    enum: ['activa', 'inactiva', 'pendiente']
  })
  estado: string;

  @Column({ 
    type: 'varchar', 
    length: 50, 
    name: 'resultado_calculo',
    nullable: true,
    enum: ['satisfacible', 'insatisfacible', 'parcial', null]
  })
  resultadoCalculo: string;

/*  // Relaciones
  @OneToMany(() => Demanda, demanda => demanda.estrategia)
  demandas: Demanda[];

  @OneToMany(() => CalculoEstrategia, calculo => calculo.estrategia)
  calculos: CalculoEstrategia[];

  // Método para calcular el total demandado (si necesitas)
  getTotalDemandado(): number {
    if (!this.demandas) return 0;
    return this.demandas.reduce((total, demanda) => total + demanda.cantidadRequerida, 0);
  }*/
}