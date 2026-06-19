import { RelacionProductoRecurso } from '../../RelacionProductoRecurso/ENTITY/RelacionProductoRecurso.entity';

export const RELACION_PRODUCTO_RECURSO_REPOSITORY = 'RELACION_PRODUCTO_RECURSO_REPOSITORY';

/**
 * Contrato del repositorio de RelacionProductoRecurso (patrón Repositorio).
 */
export interface IRelacionProductoRecursoRepository {
  buscarPorProductoConRecurso(productoId: string): Promise<RelacionProductoRecurso[]>;
}
