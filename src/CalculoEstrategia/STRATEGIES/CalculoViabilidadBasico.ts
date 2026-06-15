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
 * Algoritmo de viabilidad BÁSICO (patrón Strategy).
 *
 * Un recurso es satisfacible si la existencia en inventario cubre exactamente
 * la cantidad requerida. La estrategia es viable si todos sus productos lo son.
 * Reproduce el comportamiento histórico del sistema y es la estrategia por defecto.
 */
@Injectable()
export class CalculoViabilidadBasico implements IEstrategiaCalculo {
  readonly nombre = 'basico';

  calcular(contexto: ContextoCalculoViabilidad): ResultadoCalculoDto {
    const productos: ResultadoProductoDto[] = contexto.productos.map((producto) => {
      const recursos: ResultadoRecursoDto[] = producto.recursos.map((recurso) => {
        const esSatisfacible = recurso.existenciaInventario >= recurso.cantidadRequerida;
        const deficit = esSatisfacible
          ? 0
          : recurso.cantidadRequerida - recurso.existenciaInventario;

        return {
          recursoId: recurso.recursoId,
          nombre: recurso.nombre,
          tipoRecurso: recurso.tipoRecurso,
          unidadMedida: recurso.unidadMedida,
          tipoRelacion: recurso.tipoRelacion,
          cantidadRequerida: recurso.cantidadRequerida,
          existenciaInventario: recurso.existenciaInventario,
          esSatisfacible,
          deficit,
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

    const estrategiaEsViable = productos.every((p) => p.esSatisfacible);

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
