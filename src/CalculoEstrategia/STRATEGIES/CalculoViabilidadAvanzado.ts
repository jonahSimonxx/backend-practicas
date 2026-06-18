import { Injectable } from '@nestjs/common';
import {
  ContextoCalculoViabilidad,
  IEstrategiaCalculo,
} from './IEstrategiaCalculo';
import {
  ResultadoCalculoDto,
  ResultadoProductoDto,
  ResultadoRecursoDto,
} from '../DTOS/resultado-calculo.dto';

/**
 * Algoritmo de viabilidad AVANZADO (patrón Strategy).
 *
 * Refina al algoritmo básico añadiendo dos reglas de negocio:
 *  1. Margen de seguridad: exige un 10% extra de existencia sobre la cantidad
 *     requerida, de modo que la estrategia no quede "al límite" del stock.
 *  2. Restricción presupuestaria: aunque el inventario alcance, la estrategia se
 *     marca como "imposible" si el presupuesto utilizado supera el máximo definido.
 */
@Injectable()
export class CalculoViabilidadAvanzado implements IEstrategiaCalculo {
  readonly nombre = 'avanzado';

  /** Margen de seguridad aplicado a la cantidad requerida (10%). */
  private static readonly MARGEN_SEGURIDAD = 1.1;

  calcular(contexto: ContextoCalculoViabilidad): ResultadoCalculoDto {
    const productos: ResultadoProductoDto[] = contexto.productos.map((producto) => {
      const recursos: ResultadoRecursoDto[] = producto.recursos.map((recurso) => {
        const requeridoConMargen =
          recurso.cantidadRequerida * CalculoViabilidadAvanzado.MARGEN_SEGURIDAD;
        const esSatisfacible = recurso.existenciaInventario >= requeridoConMargen;
        const deficit = esSatisfacible
          ? 0
          : requeridoConMargen - recurso.existenciaInventario;

        return {
          recursoId: recurso.recursoId,
          nombre: recurso.nombre,
          tipoRecurso: recurso.tipoRecurso,
          unidadMedida: recurso.unidadMedida,
          tipoRelacion: recurso.tipoRelacion,
          cantidadRequerida: recurso.cantidadRequerida,
          existenciaInventario: recurso.existenciaInventario,
          esSatisfacible,
          deficit: Number(deficit.toFixed(2)),
          inventarios: recurso.inventarios,
        };
      });

      return {
        productoId: producto.productoId,
        nombreProducto: producto.nombreProducto,
        demanda: producto.demanda,
        recursos,
        esSatisfacible: recursos.every((r) => r.esSatisfacible),
      };
    });

    const presupuestoUtilizado =
      contexto.presupuestoUtilizadoPrevio ??
      productos.reduce(
        (totalEstrategia, producto) =>
          totalEstrategia +
          producto.recursos.reduce(
            (totalProducto, recurso) => totalProducto + recurso.cantidadRequerida,
            0,
          ),
        0,
      );

    const inventarioSuficiente = productos.every((p) => p.esSatisfacible);
    const dentroDePresupuesto =
      !contexto.presupuestoMaximo || presupuestoUtilizado <= contexto.presupuestoMaximo;
    const estrategiaEsViable = inventarioSuficiente && dentroDePresupuesto;

    return {
      estrategiaId: contexto.estrategiaId,
      nombreEstrategia: contexto.nombreEstrategia,
      resultadoGeneral: estrategiaEsViable ? 'posible' : 'imposible',
      presupuestoUtilizado,
      fechaCalculo: new Date(),
      productos,
    };
  }
}
