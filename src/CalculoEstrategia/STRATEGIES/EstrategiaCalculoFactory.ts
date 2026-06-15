import { Injectable } from '@nestjs/common';
import { IEstrategiaCalculo } from './IEstrategiaCalculo';
import { CalculoViabilidadBasico } from './CalculoViabilidadBasico';
import { CalculoViabilidadAvanzado } from './CalculoViabilidadAvanzado';

/** Algoritmos de cálculo de viabilidad disponibles. */
export type TipoAlgoritmoCalculo = 'basico' | 'avanzado';

/**
 * Selector de estrategias (Context/Factory del patrón Strategy).
 *
 * Mantiene el registro de algoritmos disponibles y entrega el adecuado según el
 * nombre solicitado, devolviendo el algoritmo básico como predeterminado para
 * preservar el comportamiento histórico.
 */
@Injectable()
export class EstrategiaCalculoFactory {
  private readonly estrategias: Map<string, IEstrategiaCalculo>;

  constructor(
    private readonly basico: CalculoViabilidadBasico,
    private readonly avanzado: CalculoViabilidadAvanzado,
  ) {
    this.estrategias = new Map<string, IEstrategiaCalculo>([
      [basico.nombre, basico],
      [avanzado.nombre, avanzado],
    ]);
  }

  /**
   * Devuelve el algoritmo solicitado o el básico si no se especifica/encuentra.
   */
  obtener(algoritmo?: string | null): IEstrategiaCalculo {
    if (!algoritmo) {
      return this.basico;
    }
    return this.estrategias.get(algoritmo) ?? this.basico;
  }
}
