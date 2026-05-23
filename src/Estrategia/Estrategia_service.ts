import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Estrategia } from './ENTITY/Estrategia.entity';
import { CreateEstrategiaDto } from './DTOS/CreateEstrategiaDto';
import { UpdateEstrategiaDto } from './DTOS/UpdateEstrategiaDto';
import { EstrategiaDto } from './DTOS/EstrategiaDto';
import { RelacionProductoRecurso } from '../RelacionProductoRecurso/ENTITY/RelacionProductoRecurso.entity';
import { Inventario } from '../Inventario/ENTITY/Inventario.entity';
import { CalculoEstrategia } from '../CalculoEstrategia/ENTITY/CalculoEstrategia.entity';
import { DetalleCalculoRecurso } from '../DetalleCalculoRecurso/ENTITY/DetalleCalculoRecurso.entity';
import { ResultadoCalculoDto, ResultadoProductoDto, ResultadoRecursoDto } from '../CalculoEstrategia/DTOS/resultado-calculo.dto';
import { CalculoRequestDto } from '../CalculoEstrategia/DTOS/calculo-request.dto';

interface InventarioDetalle {
  almacen: string;
  lote: string;
  fabricante: string;
  fechaFabricacion: Date;
  fechaCaducidad: Date;
  cantidad: number;
  unidadMedida: string;
}
// interfaz segunda funcion
interface ExistenciaDetalle {
  almacen: string;
  bdInventario: string;      // ID o nombre de la BD
  area: string;              // área de almacenamiento
  numeroMuestreo: string;    // número de muestreo
  fabricante: string;
  fechaFabricacion: Date;
  fechaCaducidad: Date;
  fechaVigencia: Date;
  lote: string;
  cantidad: number;
  unidadMedida: string;
}

@Injectable()
export class EstrategiaService {
  constructor(
    @InjectRepository(Estrategia)
    private estrategiaRepository: Repository<Estrategia>,
    @InjectRepository(RelacionProductoRecurso)
    private relacionRepository: Repository<RelacionProductoRecurso>,
    @InjectRepository(Inventario)
    private inventarioRepository: Repository<Inventario>,
    @InjectRepository(CalculoEstrategia)
    private calculoRepository: Repository<CalculoEstrategia>,
    @InjectRepository(DetalleCalculoRecurso)
    private detalleCalculoRepository: Repository<DetalleCalculoRecurso>,
  ) {}

  // Crea una nueva estrategia
  async create(createEstrategiaDto: CreateEstrategiaDto): Promise<EstrategiaDto> {
    const estrategia = this.estrategiaRepository.create({
      id: createEstrategiaDto.id,
      nombre: createEstrategiaDto.nombre,
      descripcion: createEstrategiaDto.descripcion,
      presupuestoMaximo: createEstrategiaDto.presupuestoMaximo,
      estado: createEstrategiaDto.estado || 'inactiva',
      resultadoCalculo: 'sin calcular',
      fechaCreacion: new Date(),
    });
    const savedEstrategia = await this.estrategiaRepository.save(estrategia);
    return this.mapToDto(savedEstrategia);
  }

  // Lista todas las estrategias
  async findAll(): Promise<EstrategiaDto[]> {
    const estrategias = await this.estrategiaRepository.find({
      order: { fechaCreacion: 'DESC' }
    });
    return estrategias.map(estrategia => this.mapToDto(estrategia));
  }

  // Busca una estrategia por ID
  async findOne(id: string): Promise<EstrategiaDto> {
    const estrategia = await this.estrategiaRepository.findOne({
      where: { id }
    });
    if (!estrategia) {
      throw new NotFoundException(`Estrategia con ID ${id} no encontrada`);
    }
    return this.mapToDto(estrategia);
  }

  // Busca estrategias por ID (para filtrado)
  async findById(id: string): Promise<EstrategiaDto[]> {
    const estrategias = await this.estrategiaRepository.find({
      where: { id },
      order: { nombre: 'ASC' }
    });
    return estrategias.map(estrategia => this.mapToDto(estrategia));
  }

  // Busca estrategias por estado
  async findByEstado(estado: string): Promise<EstrategiaDto[]> {
    const estrategias = await this.estrategiaRepository.find({
      where: { estado },
      order: { nombre: 'ASC' }
    });
    return estrategias.map(estrategia => this.mapToDto(estrategia));
  }

  // Actualiza una estrategia
  async update(id: string, updateEstrategiaDto: UpdateEstrategiaDto): Promise<EstrategiaDto> {
    const estrategia = await this.estrategiaRepository.findOne({ where: { id } });
    if (!estrategia) {
      throw new NotFoundException(`Estrategia con ID ${id} no encontrada`);
    }
    // El campo 'id' no puede venir en el body (excluido por OmitType en el DTO)
    Object.assign(estrategia, updateEstrategiaDto);
    const updatedEstrategia = await this.estrategiaRepository.save(estrategia);
    return this.mapToDto(updatedEstrategia);
  }

  // Elimina una estrategia
  async remove(id: string): Promise<void> {
    const estrategia = await this.estrategiaRepository.findOne({ where: { id } });
    if (!estrategia) {
      throw new NotFoundException(`Estrategia con ID ${id} no encontrada`);
    }
    const result = await this.estrategiaRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Estrategia con ID ${id} no encontrada`);
    }
  }

  // Activa una estrategia
  async activarEstrategia(id: string): Promise<EstrategiaDto> {
    return this.cambiarEstado(id, 'activa');
  }

  // Desactiva una estrategia
  async desactivarEstrategia(id: string): Promise<EstrategiaDto> {
    return this.cambiarEstado(id, 'inactiva');
  }

  // Cambia el estado de una estrategia
  private async cambiarEstado(id: string, nuevoEstado: string): Promise<EstrategiaDto> {
    const estrategia = await this.estrategiaRepository.findOne({ where: { id } });
    if (!estrategia) {
      throw new NotFoundException(`Estrategia con ID ${id} no encontrada`);
    }
    estrategia.estado = nuevoEstado;
    const updatedEstrategia = await this.estrategiaRepository.save(estrategia);
    return this.mapToDto(updatedEstrategia);
  }

  // Obtiene la existencia total de un recurso
  async obtenerExistenciaTotalRecurso(recursoId: string): Promise<number> {
    const inventarios = await this.inventarioRepository.find({
      where: { recursoId, estado: 'disponible' },
    });
    return inventarios.reduce((total, inventario) => total + inventario.cantidadDisponible, 0);
  }

  // Calcula la viabilidad detallada de una estrategia
  async calcularEstrategiaDetallada(
    id: string,
    options?: CalculoRequestDto
  ): Promise<ResultadoCalculoDto> {
    const estrategia = await this.estrategiaRepository.findOne({
      where: { id },
      relations: ['demandas', 'demandas.producto'],
    });

    if (!estrategia) {
      throw new NotFoundException(`Estrategia con ID ${id} no encontrada`);
    }

    const resultadosProductos: ResultadoProductoDto[] = [];

    for (const demanda of estrategia.demandas || []) {
      const producto = demanda.producto;
      const relaciones = await this.relacionRepository.find({
        where: { productoId: producto.id },
        relations: ['recurso'],
      });

      const recursosResultados: ResultadoRecursoDto[] = [];

      for (const relacion of relaciones) {
        const recurso = relacion.recurso;
        const cantidadRequeridaTotal = relacion.cantidadRequerida * demanda.cantidadRequerida;
        const existenciaTotal = await this.obtenerExistenciaTotalRecurso(recurso.id);
        const esSatisfacible = existenciaTotal >= cantidadRequeridaTotal;
        const deficit = esSatisfacible ? 0 : cantidadRequeridaTotal - existenciaTotal;

        const inventariosDetalle = await this.inventarioRepository.find({
          where: { recursoId: recurso.id, estado: 'disponible' },
        });

        recursosResultados.push({
          recursoId: recurso.id,
          nombre: recurso.nombre,
          tipoRecurso: recurso.tipoRecurso,
          unidadMedida: recurso.unidadMedida,
          tipoRelacion: relacion.tipoRelacion, 
          cantidadRequerida: cantidadRequeridaTotal,
          existenciaInventario: existenciaTotal,
          esSatisfacible,
          deficit,
          inventarios: inventariosDetalle.map(i => ({
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

      const productoEsSatisfacible = recursosResultados.every(r => r.esSatisfacible);
      resultadosProductos.push({
        productoId: producto.id,
        nombreProducto: producto.nombre,
        demanda: demanda.cantidadRequerida,
        recursos: recursosResultados,
        esSatisfacible: productoEsSatisfacible,
      });
    }

    const estrategiaEsViable = resultadosProductos.every(p => p.esSatisfacible);
    const resultadoGeneral = estrategiaEsViable ? 'posible' : 'imposible';

    await this.estrategiaRepository.update(id, { resultadoCalculo: resultadoGeneral });

    // Calcular el presupuesto utilizado: suma de cantidadRequerida de todos los recursos
    // a través de los productos de la estrategia (sumatoria del consumo de recursos).
    // Si existe un registro previo en CALCULO_ESTRATEGIA, tomamos el presupuestoUtilizado más reciente;
    // de lo contrario lo calculamos como la suma de la cantidadRequerida de cada recurso.
    const ultimoCalculo = await this.calculoRepository.findOne({
      where: { estrategiaId: id },
      order: { fechaCalculo: 'DESC' },
    });

    const presupuestoUtilizado = ultimoCalculo
      ? Number(ultimoCalculo.presupuestoUtilizado)
      : resultadosProductos.reduce(
          (totalEstrategia, producto) =>
            totalEstrategia +
            producto.recursos.reduce(
              (totalProducto, recurso) => totalProducto + recurso.cantidadRequerida,
              0,
            ),
          0,
        );

    return {
      estrategiaId: estrategia.id,
      nombreEstrategia: estrategia.nombre,
      resultadoGeneral,
      presupuestoUtilizado,
      fechaCalculo: new Date(),
      productos: resultadosProductos,
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
    const estrategia = await this.estrategiaRepository.findOne({
      where: { id: estrategiaId },
      relations: ['demandas', 'demandas.producto'],
    });

    if (!estrategia) {
      throw new NotFoundException(`Estrategia con ID ${estrategiaId} no encontrada`);
    }

    const resultadosProductos: { productoId: string; esSatisfacible: boolean }[] = [];

    for (const demanda of estrategia.demandas) {
      const producto = demanda.producto;
      const relaciones = await this.relacionRepository.find({
        where: { productoId: producto.id },
        relations: ['recurso'],
      });

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

    const estrategiaEsViable = resultadosProductos.every(p => p.esSatisfacible);
    const productosSatisfacibles = resultadosProductos
      .filter(p => p.esSatisfacible)
      .map(p => p.productoId);
    const productosNoSatisfacibles = resultadosProductos
      .filter(p => !p.esSatisfacible)
      .map(p => p.productoId);

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
