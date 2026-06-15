import { CalculoViabilidadBasico } from './CalculoViabilidadBasico';
import { CalculoViabilidadAvanzado } from './CalculoViabilidadAvanzado';
import { EstrategiaCalculoFactory } from './EstrategiaCalculoFactory';
import { ContextoCalculoViabilidad } from './IEstrategiaCalculo';

/**
 * Construye un contexto de cálculo donde la existencia cubre exactamente la
 * cantidad requerida (caso "al límite").
 */
function contextoAlLimite(): ContextoCalculoViabilidad {
  return {
    estrategiaId: 'EST-1',
    nombreEstrategia: 'Estrategia de prueba',
    presupuestoMaximo: 1000,
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
            existenciaInventario: 100, // justo al límite
            inventarios: [],
          },
        ],
      },
    ],
  };
}

describe('Patrón Strategy - Algoritmos de viabilidad', () => {
  const basico = new CalculoViabilidadBasico();
  const avanzado = new CalculoViabilidadAvanzado();

  it('el algoritmo básico considera viable cuando la existencia iguala lo requerido', () => {
    const resultado = basico.calcular(contextoAlLimite());

    expect(resultado.resultadoGeneral).toBe('posible');
    expect(resultado.productos[0].recursos[0].esSatisfacible).toBe(true);
    expect(resultado.productos[0].recursos[0].deficit).toBe(0);
  });

  it('el algoritmo avanzado NO es viable al límite por exigir margen de seguridad (10%)', () => {
    const resultado = avanzado.calcular(contextoAlLimite());

    expect(resultado.resultadoGeneral).toBe('imposible');
    expect(resultado.productos[0].recursos[0].esSatisfacible).toBe(false);
    // Requiere 100 * 1.1 = 110, hay 100 => déficit de 10
    expect(resultado.productos[0].recursos[0].deficit).toBe(10);
  });

  it('el algoritmo avanzado marca imposible si se excede el presupuesto máximo', () => {
    const contexto = contextoAlLimite();
    contexto.presupuestoMaximo = 50; // menor que la cantidad requerida (100)
    contexto.productos[0].recursos[0].existenciaInventario = 1000; // inventario de sobra

    const resultado = avanzado.calcular(contexto);

    expect(resultado.presupuestoUtilizado).toBe(100);
    expect(resultado.resultadoGeneral).toBe('imposible');
  });

  it('los dos algoritmos son intercambiables y producen distinto veredicto sobre el mismo contexto', () => {
    const ctx = contextoAlLimite();
    expect(basico.calcular(ctx).resultadoGeneral).toBe('posible');
    expect(avanzado.calcular(ctx).resultadoGeneral).toBe('imposible');
  });
});

describe('Patrón Strategy - EstrategiaCalculoFactory', () => {
  const basico = new CalculoViabilidadBasico();
  const avanzado = new CalculoViabilidadAvanzado();
  const factory = new EstrategiaCalculoFactory(basico, avanzado);

  it('devuelve el algoritmo básico por defecto cuando no se especifica', () => {
    expect(factory.obtener().nombre).toBe('basico');
    expect(factory.obtener(undefined).nombre).toBe('basico');
    expect(factory.obtener(null).nombre).toBe('basico');
  });

  it('devuelve el algoritmo avanzado cuando se solicita', () => {
    expect(factory.obtener('avanzado').nombre).toBe('avanzado');
  });

  it('cae al algoritmo básico ante un nombre desconocido', () => {
    expect(factory.obtener('inexistente').nombre).toBe('basico');
  });
});
