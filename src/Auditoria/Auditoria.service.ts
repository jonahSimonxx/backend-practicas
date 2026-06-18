import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auditoria } from './ENTITY/Auditoria.entity';
import { AUDITORIA_EVENT, AuditoriaEvento, ResultadoAuditoria } from './EVENTS/auditoria.event';

/**
 * Observador del patrón Observer (RF-016).
 *
 * Escucha los eventos de auditoría emitidos por los servicios de dominio y los
 * persiste en la tabla AUDITORIA. Al estar desacoplado mediante eventos, añadir
 * trazabilidad a un servicio no obliga a modificar este observador.
 */
@Injectable()
export class AuditoriaService {
  private readonly logger = new Logger(AuditoriaService.name);

  constructor(
    @InjectRepository(Auditoria)
    private readonly auditoriaRepository: Repository<Auditoria>,
  ) {}

  /**
   * Reacciona a cada acción de negocio y la registra. Los errores se atrapan
   * para que la auditoría nunca interrumpa la operación principal.
   */
  @OnEvent(AUDITORIA_EVENT, { async: true })
  async registrar(evento: AuditoriaEvento): Promise<void> {
    try {
      const registro = this.auditoriaRepository.create({
        accion: evento.accion,
        entidad: evento.entidad,
        entidadId: evento.entidadId ?? null,
        usuarioId: evento.usuarioId ?? null,
        resultado: evento.resultado ?? ResultadoAuditoria.EXITO,
        detalles: evento.detalles ?? null,
      });
      await this.auditoriaRepository.save(registro);
    } catch (error) {
      this.logger.error(
        `No se pudo registrar la auditoría de la acción ${evento.accion}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  /** Lista todos los registros de auditoría (más recientes primero). */
  findAll(): Promise<Auditoria[]> {
    return this.auditoriaRepository.find({ order: { fechaHora: 'DESC' } });
  }

  /** Filtra los registros por entidad y, opcionalmente, por su ID. */
  findByEntidad(entidad: string, entidadId?: string): Promise<Auditoria[]> {
    const where = entidadId ? { entidad, entidadId } : { entidad };
    return this.auditoriaRepository.find({ where, order: { fechaHora: 'DESC' } });
  }
}
