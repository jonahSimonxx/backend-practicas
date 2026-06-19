import { CalculoViabilidadBasico } from './CalculoViabilidadBasico';
import { ContextoCalculoViabilidad } from './IEstrategiaCalculo';

/**
 * Contexto base parametrizado por la existencia disponible del recurso.
 */
function contexto(existencia: number): ContextoCalculoViabilidad {
  return {
    estrategiaId: 'EST-1',
    nombreEstrategia: 'Estrategia de prueba',
    presupuestoUtilizadoPrevio: null,
    productos: [
      {
        productoId: 'PROD-1',
        nombreProducto: 'Producto 1',
        demanda: 10,
        recursos: [
          {
            recursoId: 'REC-1',
            nombre: 'Recurso 1',
            tipoRecurso: 'materia-prima',
            unidadMedida: 'kg',
            tipoRelacion: 'consumo',
            cantidadRequerida: 100,
            existenciaInventario: existencia,
            inventarios: [],
          },
        ],
      },
    ],
  };
}

describe('Patrón Strategy - CalculoViabilidadBasico (lógica de viabilidad)', () => {
  const estrategia = new CalculoViabilidadBasico();

  it('es POSIBLE cuando la existencia cubre lo requerido (100 >= 100)', () => {
    const resultado = estrategia.calcular(contexto(100));

    expect(resultado.resultadoGeneral).toBe('posible');
    expect(resultado.productos[0].recursos[0].esSatisfacible).toBe(true);
    expect(resultado.productos[0].recursos[0].deficit).toBe(0);
  });

  it('es IMPOSIBLE y reporta déficit cuando falta existencia (80 < 100)', () => {
    const resultado = estrategia.calcular(contexto(80));

    expect(resultado.resultadoGeneral).toBe('imposible');
    expect(resultado.productos[0].recursos[0].esSatisfacible).toBe(false);
    expect(resultado.productos[0].recursos[0].deficit).toBe(20);
  });

  it('calcula el presupuesto utilizado como el consumo total de recursos', () => {
    const resultado = estrategia.calcular(contexto(100));
    expect(resultado.presupuestoUtilizado).toBe(100);
  });
});
