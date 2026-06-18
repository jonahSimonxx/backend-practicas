import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

/**
 * Registro de auditoría (RF-016: Trazabilidad y auditoría de acciones).
 *
 * Cada fila representa una acción de negocio observada (patrón Observer) que ha
 * ocurrido en el sistema, junto con su contexto: entidad afectada, usuario,
 * resultado y un snapshot opcional de los datos involucrados.
 */
@Entity('AUDITORIA')
export class Auditoria {
  @PrimaryGeneratedColumn('uuid', { name: 'ID' })
  id: string;

  /** Acción ejecutada, p. ej. CREAR_ESTRATEGIA, CALCULAR_VIABILIDAD. */
  @Index()
  @Column({ name: 'ACCION', type: 'varchar', length: 60 })
  accion: string;

  /** Nombre de la entidad de dominio afectada, p. ej. Estrategia. */
  @Column({ name: 'ENTIDAD', type: 'varchar', length: 60 })
  entidad: string;

  /** Identificador de la fila afectada (si aplica). */
  @Column({ name: 'ENTIDAD_ID', type: 'varchar', length: 60, nullable: true })
  entidadId: string | null;

  /** Usuario que originó la acción (extraído del JWT), si está disponible. */
  @Column({ name: 'USUARIO_ID', type: 'varchar', length: 60, nullable: true })
  usuarioId: string | null;

  /** Resultado de la acción: EXITO | ERROR. */
  @Column({ name: 'RESULTADO', type: 'varchar', length: 20, default: 'EXITO' })
  resultado: string;

  /** Snapshot opcional del payload/cambios asociados a la acción. */
  @Column({ name: 'DETALLES', type: 'jsonb', nullable: true })
  detalles: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'FECHA_HORA', type: 'timestamp with time zone' })
  fechaHora: Date;
}
