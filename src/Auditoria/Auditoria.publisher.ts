import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AUDITORIA_EVENT, AuditoriaEvento } from './EVENTS/auditoria.event';

/**
 * Sujeto del patrón Observer.
 *
 * Los servicios de dominio inyectan este publicador y notifican acciones sin
 * conocer quién las observa. La emisión es "fire-and-forget": un fallo al
 * registrar la auditoría nunca debe romper la operación de negocio.
 */
@Injectable()
export class AuditoriaPublisher {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  emitir(evento: AuditoriaEvento): void {
    this.eventEmitter.emit(AUDITORIA_EVENT, new AuditoriaEvento(evento));
  }
}
