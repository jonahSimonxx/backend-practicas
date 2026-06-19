import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateEstrategiaDto } from './DTOS/CreateEstrategiaDto';
import { UpdateEstrategiaDto } from './DTOS/UpdateEstrategiaDto';
import { EstrategiaDto } from './DTOS/EstrategiaDto';
import { Estrategia } from './ENTITY/Estrategia.entity';
import {
  ESTRATEGIA_REPOSITORY,
  type IEstrategiaRepository,
} from '../DataBase/INTERFACES/IEstrategiaRepository';
import {
  INVENTARIO_REPOSITORY,
  type IInventarioRepository,
} from '../DataBase/INTERFACES/IInventarioRepository';
import {
  RELACION_PRODUCTO_RECURSO_REPOSITORY,
  type IRelacionProductoRecursoRepository,
} from '../DataBase/INTERFACES/IRelacionProductoRecursoRepository';
import {
  CALCULO_ESTRATEGIA_REPOSITORY,
  type ICalculoEstrategiaRepository,
} from '../DataBase/INTERFACES/ICalculoEstrategiaRepository';
import { ResultadoCalculoDto } from '../CalculoEstrategia/DTOS/resultado-calculo.dto';
import { CalculoRequestDto } from '../CalculoEstrategia/DTOS/calculo-request.dto';
import {
  ESTRATEGIA_CALCULO,
  type IEstrategiaCalculo,
  ContextoCalculoViabilidad,
  ProductoContexto,
  RecursoContexto,
} from '../CalculoEstrategia/STRATEGIES/IEstrategiaCalculo';
import { AuditoriaPublisher } from '../Auditoria/Auditoria.publisher';
import { AccionAuditoria, AuditoriaEvento } from '../Auditoria/EVENTS/auditoria.event';

@Injectable()
export class EstrategiaService {
  constructor(
    @Inject(ESTRATEGIA_REPOSITORY)
    private readonly estrategiaRepository: IEstrategiaRepository,
    @Inject(RELACION_PRODUCTO_RECURSO_REPOSITORY)
    private readonly relacionRepository: IRelacionProductoRecursoRepository,
    @Inject(INVENTARIO_REPOSITORY)
    private readonly inventarioRepository: IInventarioRepository,
    @Inject(CALCULO_ESTRATEGIA_REPOSITORY)
    private readonly calculoRepository: ICalculoEstrategiaRepository,
    @Inject(ESTRATEGIA_CALCULO)
    private readonly calculoViabilidad: IEstrategiaCalculo,
    private readonly auditoria: AuditoriaPublisher,
  ) {}

  // Crea una nueva estrategia
  async create(createEstrategiaDto: CreateEstrategiaDto, usuarioId?: string): Promise<EstrategiaDto> {
    const estrategia = this.estrategiaRepository.crear({
      id: createEstrategiaDto.id,
      nombre: createEstrategiaDto.nombre,
      descripcion: createEstrategiaDto.descripcion,
      presupuestoMaximo: createEstrategiaDto.presupuestoMaximo,
      estado: createEstrategiaDto.estado || 'inactiva',
      resultadoCalculo: 'sin calcular',
      fechaCreacion: new Date(),
    });
    const savedEstrategia = await this.estrategiaRepository.guardar(estrategia);

    this.auditoria.emitir(
      new AuditoriaEvento({
        accion: AccionAuditoria.CREAR_ESTRATEGIA,
        entidad: 'Estrategia',
        entidadId: savedEstrategia.id,
        usuarioId,
        detalles: { nombre: savedEstrategia.nombre, estado: savedEstrategia.estado },
      }),
    );

    return this.mapToDto(savedEstrategia);
  }

  // Lista todas las estrategias
  async findAll(): Promise<EstrategiaDto[]> {
    const estrategias = await this.estrategiaRepository.buscarTodos();
    return estrategias.map((estrategia) => this.mapToDto(estrategia));
  }

  // Busca una estrategia por ID
  async findOne(id: string): Promise<EstrategiaDto> {
    const estrategia = await this.estrategiaRepository.buscarPorId(id);
    if (!estrategia) {
      throw new NotFoundException(`Estrategia con ID ${id} no encontrada`);
    }
    return this.mapToDto(estrategia);
  }

  // Busca estrategias por ID (para filtrado)
  async findById(id: string): Promise<EstrategiaDto[]> {
    const estrategia = await this.estrategiaRepository.buscarPorId(id);
    return estrategia ? [this.mapToDto(estrategia)] : [];
  }

  // Busca estrategias por estado
  async findByEstado(estado: string): Promise<EstrategiaDto[]> {
    const estrategias = await this.estrategiaRepository.buscarPorEstado(estado);
    return estrategias.map((estrategia) => this.mapToDto(estrategia));
  }

  // Actualiza una estrategia
  async update(
    id: string,
    updateEstrategiaDto: UpdateEstrategiaDto,
    usuarioId?: string,
  ): Promise<EstrategiaDto> {
    const estrategia = await this.estrategiaRepository.buscarPorId(id);
    if (!estrategia) {
      throw new NotFoundException(`Estrategia con ID ${id} no encontrada`);
    }
    // El campo 'id' no puede venir en el body (excluido por OmitType en el DTO)
    Object.assign(estrategia, updateEstrategiaDto);
    const updatedEstrategia = await this.estrategiaRepository.guardar(estrategia);

    this.auditoria.emitir(
      new AuditoriaEvento({
        accion: AccionAuditoria.ACTUALIZAR_ESTRATEGIA,
        entidad: 'Estrategia',
        entidadId: id,
        usuarioId,
        detalles: { cambios: { ...updateEstrategiaDto } },
      }),
    );

    return this.mapToDto(updatedEstrategia);
  }

  // Elimina una estrategia
  async remove(id: string, usuarioId?: string): Promise<void> {
    const estrategia = await this.estrategiaRepository.buscarPorId(id);
    if (!estrategia) {
      throw new NotFoundException(`Estrategia con ID ${id} no encontrada`);
    }
    const filasAfectadas = await this.estrategiaRepository.eliminar(id);
    if (filasAfectadas === 0) {
      throw new NotFoundException(`Estrategia con ID ${id} no encontrada`);
    }

    this.auditoria.emitir(
      new AuditoriaEvento({
        accion: AccionAuditoria.ELIMINAR_ESTRATEGIA,
        entidad: 'Estrategia',
        entidadId: id,
        usuarioId,
      }),
    );
  }

  // Activa una estrategia
  async activarEstrategia(id: string, usuarioId?: string): Promise<EstrategiaDto> {
    return this.cambiarEstado(id, 'activa', AccionAuditoria.ACTIVAR_ESTRATEGIA, usuarioId);
  }

  // Desactiva una estrategia
  async desactivarEstrategia(id: string, usuarioId?: string): Promise<EstrategiaDto> {
    return this.cambiarEstado(id, 'inactiva', AccionAuditoria.DESACTIVAR_ESTRATEGIA, usuarioId);
  }

  // Cambia el estado de una estrategia
  private async cambiarEstado(
    id: string,
    nuevoEstado: string,
    accion: AccionAuditoria,
    usuarioId?: string,
  ): Promise<EstrategiaDto> {
    const estrategia = await this.estrategiaRepository.buscarPorId(id);
    if (!estrategia) {
      throw new NotFoundException(`Estrategia con ID ${id} no encontrada`);
    }
    estrategia.estado = nuevoEstado;
    const updatedEstrategia = await this.estrategiaRepository.guardar(estrategia);

    this.auditoria.emitir(
      new AuditoriaEvento({
        accion,
        entidad: 'Estrategia',
        entidadId: id,
        usuarioId,
        detalles: { estado: nuevoEstado },
      }),
    );

    return this.mapToDto(updatedEstrategia);
  }

  // Obtiene la existencia total de un recurso
  async obtenerExistenciaTotalRecurso(recursoId: string): Promise<number> {
    const inventarios = await this.inventarioRepository.buscarDisponiblesPorRecurso(recursoId);
    return inventarios.reduce(
      (total, inventario) => total + Number(inventario.cantidadDisponible),
      0,
    );
  }

  // Calcula la viabilidad detallada de una estrategia.
  // Conserva su finalidad original; ahora obtiene los datos vía repositorios
  // (Repositorio), delega la decisión en la estrategia de cálculo (Strategy) y
  // notifica la acción para su trazabilidad (Observer).
  async calcularEstrategiaDetallada(
    id: string,
    options?: CalculoRequestDto,
    usuarioId?: string,
  ): Promise<ResultadoCalculoDto> {
    const contexto = await this.construirContextoCalculo(id);

    // El servicio (contexto) delega el cálculo en la estrategia inyectada.
    const resultado = this.calculoViabilidad.calcular(contexto);

    await this.estrategiaRepository.actualizar(id, {
      resultadoCalculo: resultado.resultadoGeneral,
    });

    this.auditoria.emitir(
      new AuditoriaEvento({
        accion: AccionAuditoria.CALCULAR_VIABILIDAD,
        entidad: 'Estrategia',
        entidadId: id,
        usuarioId,
        detalles: {
          algoritmo: this.calculoViabilidad.nombre,
          resultadoGeneral: resultado.resultadoGeneral,
          presupuestoUtilizado: resultado.presupuestoUtilizado,
        },
      }),
    );

    return resultado;
  }

  /**
   * Reúne, desde los repositorios, todos los datos que el algoritmo de cálculo
   * necesita. El acceso a datos vive aquí; la decisión de viabilidad vive en la
   * estrategia (patrón Strategy).
   */
  private async construirContextoCalculo(id: string): Promise<ContextoCalculoViabilidad> {
    const estrategia = await this.estrategiaRepository.buscarPorIdConRelaciones(id, [
      'demandas',
      'demandas.producto',
    ]);

    if (!estrategia) {
      throw new NotFoundException(`Estrategia con ID ${id} no encontrada`);
    }

    const productos: ProductoContexto[] = [];

    for (const demanda of estrategia.demandas || []) {
      const producto = demanda.producto;
      const relaciones = await this.relacionRepository.buscarPorProductoConRecurso(producto.id);

      const recursos: RecursoContexto[] = [];

      for (const relacion of relaciones) {
        const recurso = relacion.recurso;
        const cantidadRequeridaTotal = relacion.cantidadRequerida * demanda.cantidadRequerida;
        const existenciaTotal = await this.obtenerExistenciaTotalRecurso(recurso.id);
        const inventariosDetalle =
          await this.inventarioRepository.buscarDisponiblesPorRecurso(recurso.id);

        recursos.push({
          recursoId: recurso.id,
          nombre: recurso.nombre,
          tipoRecurso: recurso.tipoRecurso,
          unidadMedida: recurso.unidadMedida,
          tipoRelacion: relacion.tipoRelacion,
          cantidadRequerida: cantidadRequeridaTotal,
          existenciaInventario: existenciaTotal,
          inventarios: inventariosDetalle.map((i) => ({
            almacen: i.almacenId.toString(),
            lote: i.lote.toString(),
            fabricante: i.fabricante,
            fechaFabricacion: i.fechaFabricacion,
            fechaCaducidad: i.fechaCaducidad,
            cantidad: i.cantidadDisponible,
            unidadMedida: i.unidadMedida,
          })),
        });
      }

      productos.push({
        productoId: producto.id,
        nombreProducto: producto.nombre,
        demanda: demanda.cantidadRequerida,
        recursos,
      });
    }

    const ultimoCalculo = await this.calculoRepository.buscarUltimoPorEstrategia(id);

    return {
      estrategiaId: estrategia.id,
      nombreEstrategia: estrategia.nombre,
      presupuestoUtilizadoPrevio: ultimoCalculo
        ? Number(ultimoCalculo.presupuestoUtilizado)
        : null,
      productos,
    };
  }

  // Calcula viabilidad sencilla (solo si es viable o no)
  async calcularViabilidadEstrategiaSencilla(estrategiaId: string): Promise<{
    estrategiaId: string;
    nombreEstrategia: string;
    esViable: boolean;
    productosSatisfacibles: string[];
    productosNoSatisfacibles: string[];
  }> {
    const estrategia = await this.estrategiaRepository.buscarPorIdConRelaciones(estrategiaId, [
      'demandas',
      'demandas.producto',
    ]);

    if (!estrategia) {
      throw new NotFoundException(`Estrategia con ID ${estrategiaId} no encontrada`);
    }

    const resultadosProductos: { productoId: string; esSatisfacible: boolean }[] = [];

    for (const demanda of estrategia.demandas) {
      const producto = demanda.producto;
      const relaciones = await this.relacionRepository.buscarPorProductoConRecurso(producto.id);

      let productoEsSatisfacible = true;

      for (const relacion of relaciones) {
        const recurso = relacion.recurso;
        const cantidadRequeridaTotal = relacion.cantidadRequerida * demanda.cantidadRequerida;
        const existenciaTotal = await this.obtenerExistenciaTotalRecurso(recurso.id);

        if (existenciaTotal < cantidadRequeridaTotal) {
          productoEsSatisfacible = false;
          break;
        }
      }

      resultadosProductos.push({
        productoId: producto.id,
        esSatisfacible: productoEsSatisfacible,
      });
    }

    const estrategiaEsViable = resultadosProductos.every((p) => p.esSatisfacible);
    const productosSatisfacibles = resultadosProductos
      .filter((p) => p.esSatisfacible)
      .map((p) => p.productoId);
    const productosNoSatisfacibles = resultadosProductos
      .filter((p) => !p.esSatisfacible)
      .map((p) => p.productoId);

    return {
      estrategiaId: estrategia.id,
      nombreEstrategia: estrategia.nombre,
      esViable: estrategiaEsViable,
      productosSatisfacibles,
      productosNoSatisfacibles,
    };
  }

  // Mapea entidad a DTO
  private mapToDto(estrategia: Estrategia): EstrategiaDto {
    return {
      id: estrategia.id,
      nombre: estrategia.nombre,
      descripcion: estrategia.descripcion,
      presupuestoMaximo: estrategia.presupuestoMaximo,
      estado: estrategia.estado,
      resultadoCalculo: estrategia.resultadoCalculo,
      fechaCreacion: estrategia.fechaCreacion,
    };
  }
}
