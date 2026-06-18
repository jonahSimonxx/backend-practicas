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
  presupuestoMaximo: number;
  /** Presupuesto del último cálculo registrado, si existe. */
  presupuestoUtilizadoPrevio: number | null;
  productos: ProductoContexto[];
}

/**
 * Contrato del algoritmo de cálculo de viabilidad (patrón Strategy).
 *
 * Cada implementación concreta decide, a partir del {@link ContextoCalculoViabilidad},
 * si la estrategia es viable y construye el {@link ResultadoCalculoDto}. El
 * servicio puede intercambiar algoritmos sin cambiar su lógica de orquestación.
 */
export interface IEstrategiaCalculo {
  /** Identificador del algoritmo, usado para seleccionarlo en tiempo de ejecución. */
  readonly nombre: string;

  calcular(contexto: ContextoCalculoViabilidad): ResultadoCalculoDto;
}
