/**
 * Catálogo de acciones auditables (RF-016).
 *
 * Centraliza los nombres de las acciones para evitar strings mágicos
 * dispersos por los servicios.
 */
export enum AccionAuditoria {
  // Estrategia
  CREAR_ESTRATEGIA = 'CREAR_ESTRATEGIA',
  ACTUALIZAR_ESTRATEGIA = 'ACTUALIZAR_ESTRATEGIA',
  ELIMINAR_ESTRATEGIA = 'ELIMINAR_ESTRATEGIA',
  ACTIVAR_ESTRATEGIA = 'ACTIVAR_ESTRATEGIA',
  DESACTIVAR_ESTRATEGIA = 'DESACTIVAR_ESTRATEGIA',
  CALCULAR_VIABILIDAD = 'CALCULAR_VIABILIDAD',
  // CalculoEstrategia
  CREAR_CALCULO = 'CREAR_CALCULO',
  ACTUALIZAR_CALCULO = 'ACTUALIZAR_CALCULO',
  ELIMINAR_CALCULO = 'ELIMINAR_CALCULO',
  // Inventario
  CREAR_INVENTARIO = 'CREAR_INVENTARIO',
  ACTUALIZAR_INVENTARIO = 'ACTUALIZAR_INVENTARIO',
  ELIMINAR_INVENTARIO = 'ELIMINAR_INVENTARIO',
}

/**
 * Resultado de la acción auditada.
 */
export enum ResultadoAuditoria {
  EXITO = 'EXITO',
  ERROR = 'ERROR',
}

/**
 * Nombre del canal de eventos de auditoría usado por EventEmitter2.
 *
 * Se usa un namespace con comodín (`auditoria.registrar`) para que el
 * AuditoriaService escuche todas las acciones desde un único punto.
 */
export const AUDITORIA_EVENT = 'auditoria.registrar';

/**
 * Payload del evento de auditoría (el "mensaje" que viaja del Sujeto al
 * Observador en el patrón Observer).
 */
export class AuditoriaEvento {
  accion: AccionAuditoria;
  entidad: string;
  entidadId?: string | null;
  usuarioId?: string | null;
  resultado?: ResultadoAuditoria;
  detalles?: Record<string, unknown> | null;

  constructor(params: AuditoriaEvento) {
    this.accion = params.accion;
    this.entidad = params.entidad;
    this.entidadId = params.entidadId ?? null;
    this.usuarioId = params.usuarioId ?? null;
    this.resultado = params.resultado ?? ResultadoAuditoria.EXITO;
    this.detalles = params.detalles ?? null;
  }
}
