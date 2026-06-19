import { CalculoEstrategia } from '../../CalculoEstrategia/ENTITY/CalculoEstrategia.entity';

export const CALCULO_ESTRATEGIA_REPOSITORY = 'CALCULO_ESTRATEGIA_REPOSITORY';

/**
 * Contrato del repositorio de CalculoEstrategia (patrón Repositorio).
 */
export interface ICalculoEstrategiaRepository {
  crear(data: Partial<CalculoEstrategia>): CalculoEstrategia;
  guardar(calculo: CalculoEstrategia): Promise<CalculoEstrategia>;
  buscarTodos(): Promise<CalculoEstrategia[]>;
  buscarPorId(id: string): Promise<CalculoEstrategia | null>;
  buscarPorEstrategia(estrategiaId: string): Promise<CalculoEstrategia[]>;
  buscarPorResultado(resultadoGeneral: string): Promise<CalculoEstrategia[]>;
  buscarUltimoPorEstrategia(estrategiaId: string): Promise<CalculoEstrategia | null>;
  /** Devuelve el número de filas afectadas. */
  eliminar(id: string): Promise<number>;
}
