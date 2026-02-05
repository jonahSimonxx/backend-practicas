import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';
// import { Demanda } from '../../demandas/entities/demanda.entity'; // FUTURA
// import { CalculoEstrategia } from '../../calculos/entities/calculo-estrategia.entity'; // FUTURA

@Entity('ESTRATEGIA') // Nombre exacto en tu BD
export class Estrategia {
  @PrimaryColumn({ type: 'varchar', length: 20 }) // CORREGIDO: era @PrimaryGeneratedColumn() con number
  id: string; // CORREGIDO: era number

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

  // ========== RELACIONES FUTURAS ==========
  // @OneToMany(() => Demanda, demanda => demanda.estrategia)
  // demandas: Demanda[];
  
  // @OneToMany(() => CalculoEstrategia, calculo => calculo.estrategia)
  // calculos: CalculoEstrategia[];
  
  // Método de ayuda (descomentar cuando tengas relaciones)
  // getTotalDemandado(): number {
  //   if (!this.demandas) return 0;
  //   return this.demandas.reduce((total, demanda) => total + demanda.cantidadRequerida, 0);
  // }

  // Nuevos métodos de ayuda
  isActiva(): boolean {
    return this.estado === 'activo';
  }
}