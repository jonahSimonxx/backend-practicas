import { InventarioDetalleDto, ResultadoCalculoDto } from '../DTOS/resultado-calculo.dto';

/**
 * Datos crudos de un recurso requerido por un producto, ya resueltos contra el
 * inventario. El acceso a datos lo hace el servicio; la estrategia sólo decide
 * la viabilidad a partir de estos números.
 */
export interface RecursoContexto {
  recursoId: string;
  nombre: string;
  tipoRecurso: string;
  unidadMedida: string;
  tipoRelacion: string;
  cantidadRequerida: number;
  existenciaInventario: number;
  inventarios: InventarioDetalleDto[];
}

/** Datos crudos de un producto demandado por la estrategia. */
export interface ProductoContexto {
  productoId: string;
  nombreProducto: string;
  demanda: number;
  recursos: RecursoContexto[];
}

/** Contexto completo necesario para evaluar la viabilidad de una estrategia. */
export interface ContextoCalculoViabilidad {
  estrategiaId: string;
  nombreEstrategia: string;
  /** Presupuesto del último cálculo registrado, si existe. */
  presupuestoUtilizadoPrevio: number | null;
  productos: ProductoContexto[];
}

/**
 * Token de inyección para la estrategia de cálculo de viabilidad.
 *
 * Permite que el servicio dependa de la abstracción {@link IEstrategiaCalculo}
 * y no de una implementación concreta (las interfaces no existen en runtime).
 */
export const ESTRATEGIA_CALCULO = 'ESTRATEGIA_CALCULO';

/**
 * Contrato del algoritmo de cálculo de viabilidad (patrón Strategy).
 *
 * La implementación concreta decide, a partir del {@link ContextoCalculoViabilidad},
 * si la estrategia es viable y construye el {@link ResultadoCalculoDto}. El
 * servicio (contexto) delega en esta abstracción, de modo que el algoritmo se
 * puede sustituir sin tocar la orquestación de `calcularEstrategiaDetallada`.
 */
export interface IEstrategiaCalculo {
  /** Identificador descriptivo del algoritmo (se registra en la auditoría). */
  readonly nombre: string;

  calcular(contexto: ContextoCalculoViabilidad): ResultadoCalculoDto;
}
