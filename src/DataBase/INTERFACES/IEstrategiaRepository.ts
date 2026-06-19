import { Estrategia } from '../../Estrategia/ENTITY/Estrategia.entity';

/**
 * Token de inyección para el repositorio de Estrategia.
 *
 * Como las interfaces de TypeScript no existen en tiempo de ejecución, NestJS
 * no puede usarlas como token de inyección. Por eso se define un token explícito
 * (string) que los servicios usan con `@Inject(ESTRATEGIA_REPOSITORY)`.
 */
export const ESTRATEGIA_REPOSITORY = 'ESTRATEGIA_REPOSITORY';

/**
 * Contrato del repositorio de Estrategia (patrón Repositorio).
 *
 * Los servicios dependen de esta abstracción y no de TypeORM directamente,
 * lo que permite cambiar la implementación de persistencia sin tocar la lógica
 * de negocio y facilita el testeo con mocks.
 */
export interface IEstrategiaRepository {
  crear(data: Partial<Estrategia>): Estrategia;
  guardar(estrategia: Estrategia): Promise<Estrategia>;
  buscarTodos(): Promise<Estrategia[]>;
  buscarPorId(id: string): Promise<Estrategia | null>;
  buscarPorIdConRelaciones(id: string, relaciones: string[]): Promise<Estrategia | null>;
  buscarPorEstado(estado: string): Promise<Estrategia[]>;
  actualizar(id: string, cambios: Partial<Estrategia>): Promise<void>;
  /** Devuelve el número de filas afectadas. */
  eliminar(id: string): Promise<number>;
}
