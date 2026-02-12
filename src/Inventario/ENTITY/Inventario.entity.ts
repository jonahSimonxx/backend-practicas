import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Recurso } from '../../Recurso/ENTITY/Recurso.entity';
import { Almacen } from '../../Almacen/ENTITY/Almacen.entity';

@Entity('INVENTARIO')
export class Inventario {
  @PrimaryColumn({ type: 'varchar', length: 20 })
  id: string;

  @Column({ name: 'RECURSO_ID', type: 'varchar', length: 20 })
  recursoId: string; 

  @Column({ name: 'ALMACEN_ID', type: 'varchar', length: 20 })
  almacenId: string; 

  @Column({ name: 'LOTE', type: 'numeric', precision: 10, scale: 2 })
  lote: number;

  @Column({ name: 'FABRICANTE', type: 'varchar', length: 50 })
  fabricante: string;

  @Column({ name: 'FECHA_FABRICACION', type: 'timestamp without time zone' })
  fechaFabricacion: Date;

  @Column({ name: 'FECHA_CADUCIDAD', type: 'timestamp without time zone' })
  fechaCaducidad: Date;

  @Column({ name: 'CANTIDAD_DISPONIBLE', type: 'numeric', precision: 10, scale: 2 })
  cantidadDisponible: number;

  @Column({
    name: 'ESTADO',
    type: 'varchar',
    length: 20,
    default: 'disponible'
  })
  estado: string; 

  @Column({ name: 'NUMERO_MUESTREO', type: 'numeric', precision: 10, scale: 2 })
  numeroMuestreo: number;

  @Column({ name: 'FECHA_VIGENCIA', type: 'timestamp without time zone' })
  fechaVigencia: Date;

  // ========== RELACIONES ==========
  @ManyToOne(() => Recurso, recurso => recurso.inventarios)
  @JoinColumn({ name: 'RECURSO_ID' })
  recurso: Recurso;
  
  @ManyToOne(() => Almacen, almacen => almacen.inventarios)
  @JoinColumn({ name: 'ALMACEN_ID' })
  almacen: Almacen;
  
  isCaducado(): boolean {
    if (!this.fechaCaducidad) return false;
    return new Date() > this.fechaCaducidad;
  }

  isDisponible(): boolean {
    return this.estado === 'disponible';
  }

  isReservado(): boolean {
    return this.estado === 'reservado';
  }
}