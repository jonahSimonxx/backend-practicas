import { Inventario } from '../../Inventario/ENTITY/Inventario.entity';

export const INVENTARIO_REPOSITORY = 'INVENTARIO_REPOSITORY';

/**
 * Contrato del repositorio de Inventario (patrón Repositorio).
 *
 * Encapsula también las consultas construidas con QueryBuilder (Tarea 3:
 * visualización detallada de inventario), de modo que la lógica de acceso a
 * datos vive en la capa de repositorio y no en el servicio.
 */
export interface IInventarioRepository {
  crear(data: Partial<Inventario>): Inventario;
  guardar(inventario: Inventario): Promise<Inventario>;
  buscarTodos(): Promise<Inventario[]>;
  buscarPorId(id: string): Promise<Inventario | null>;
  buscarUno(criterios: Partial<Inventario>): Promise<Inventario | null>;
  buscarPorRecurso(recursoId: string): Promise<Inventario[]>;
  buscarPorAlmacen(almacenId: string): Promise<Inventario[]>;
  buscarPorEstado(estado: string): Promise<Inventario[]>;
  buscarDisponiblesPorRecurso(recursoId: string): Promise<Inventario[]>;
  /**
   * Inventario 'disponible' de un recurso que se encuentra en almacenes ACTIVOS.
   * Los almacenes inactivos se excluyen siempre (regla implícita del cálculo).
   * Si se pasa `almacenesPermitidos`, restringe además la búsqueda a esos almacenes.
   */
  buscarDisponiblesEnAlmacenesActivos(
    recursoId: string,
    almacenesPermitidos?: string[],
  ): Promise<Inventario[]>;
  actualizar(id: string, cambios: Partial<Inventario>): Promise<void>;
  /** Devuelve el número de filas afectadas. */
  eliminar(id: string): Promise<number>;

  // ===== Consultas con QueryBuilder (Tarea 3) =====
  buscarPorFabricante(fabricante: string): Promise<Inventario[]>;
  buscarCaducados(referencia: Date): Promise<Inventario[]>;
  buscarPorCaducar(desde: Date, hasta: Date): Promise<Inventario[]>;
}
