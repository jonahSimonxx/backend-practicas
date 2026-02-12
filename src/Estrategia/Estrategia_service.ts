import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
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
import { ResultadoCalculoDto } from '../CalculoEstrategia/DTOS/resultado-calculo.dto';
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

interface ResultadoRecurso {
  recursoId: string;
  nombre: string;
  tipoRecurso: string;
  unidadMedida: string;
  criterioRelacion: string;
  cantidadRequerida: number;
  existenciaInventario: number;
  esSatisfacible: boolean;
  deficit?: number;
  inventarios: InventarioDetalle[];
}

interface ResultadoProducto {
  productoId: string;
  nombreProducto: string;
  demanda: number;
  recursos: ResultadoRecurso[];
  esSatisfacible: boolean;
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

  async create(createEstrategiaDto: CreateEstrategiaDto): Promise<EstrategiaDto> {
    const estrategia = this.estrategiaRepository.create({
      nombre: createEstrategiaDto.nombre,
      descripcion: createEstrategiaDto.descripcion,
      presupuestoMaximo: createEstrategiaDto.presupuestoMaximo,
      estado: createEstrategiaDto.estado || 'inactivo',
      resultadoCalculo: 'sin_calcular',
      fechaCreacion: new Date(),
    });

    const savedEstrategia = await this.estrategiaRepository.save(estrategia);
    return this.mapToDto(savedEstrategia);
  }

  async findAll(): Promise<EstrategiaDto[]> {
    const estrategias = await this.estrategiaRepository.find({
      // relations: ['demandas', 'calculos'], // FUTURO
      order: { fechaCreacion: 'DESC' }
    });
    return estrategias.map(estrategia => this.mapToDto(estrategia));
  }

  async findOne(id: string): Promise<EstrategiaDto> {
    const estrategia = await this.estrategiaRepository.findOne({
      where: { id },
      // relations: ['demandas', 'calculos'] // FUTURO
    });

    if (!estrategia) {
      throw new NotFoundException(`Estrategia con ID ${id} no encontrada`);
    }

    return this.mapToDto(estrategia);
  }

  async findByEstado(estado: string): Promise<EstrategiaDto[]> {
    const estrategias = await this.estrategiaRepository.find({
      where: { estado },
      order: { nombre: 'ASC' }
    });
    return estrategias.map(estrategia => this.mapToDto(estrategia));
  }

  async findByResultadoCalculo(resultadoCalculo: string): Promise<EstrategiaDto[]> {
    const estrategias = await this.estrategiaRepository.find({
      where: { resultadoCalculo },
      order: { fechaCreacion: 'DESC' }
    });
    return estrategias.map(estrategia => this.mapToDto(estrategia));
  }

  async update(id: string, updateEstrategiaDto: UpdateEstrategiaDto): Promise<EstrategiaDto> {
    const estrategia = await this.estrategiaRepository.findOne({ where: { id } });
    
    if (!estrategia) {
      throw new NotFoundException(`Estrategia con ID ${id} no encontrada`);
    }

    // No permitir modificar el ID
    if (updateEstrategiaDto.id && updateEstrategiaDto.id !== id) {
      throw new ConflictException('No se puede modificar el ID de una estrategia');
    }

    Object.assign(estrategia, updateEstrategiaDto);
    const updatedEstrategia = await this.estrategiaRepository.save(estrategia);
    return this.mapToDto(updatedEstrategia);
  }

  async remove(id: string): Promise<void> {
    const estrategia = await this.estrategiaRepository.findOne({ 
      where: { id },
      // relations: ['demandas', 'calculos'] // FUTURO
    });

    if (!estrategia) {
      throw new NotFoundException(`Estrategia con ID ${id} no encontrada`);
    }

    // FUTURO: Validar que no tenga demandas o cálculos
    // if (estrategia.demandas && estrategia.demandas.length > 0) {
    //   throw new ConflictException(`No se puede eliminar la estrategia ${id} porque tiene demandas asociadas`);
    // }
    // if (estrategia.calculos && estrategia.calculos.length > 0) {
    //   throw new ConflictException(`No se puede eliminar la estrategia ${id} porque tiene cálculos asociados`);
    // }

    const result = await this.estrategiaRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Estrategia con ID ${id} no encontrada`);
    }
  }

  async activarEstrategia(id: string): Promise<EstrategiaDto> {
    return this.cambiarEstado(id, 'activo');
  }

  async desactivarEstrategia(id: string): Promise<EstrategiaDto> {
    return this.cambiarEstado(id, 'inactivo');
  }

  async getEstadisticas(): Promise<any> {
    const estrategias = await this.findAll();
    
    const total = estrategias.length;
    const activas = estrategias.filter(e => e.estado === 'activo').length;
    const posibles = estrategias.filter(e => e.resultadoCalculo === 'posible').length;
    const imposibles = estrategias.filter(e => e.resultadoCalculo === 'imposible').length;
    
    const presupuestoTotal = estrategias.reduce((sum, e) => sum + e.presupuestoMaximo, 0);
    const presupuestoPromedio = total > 0 ? presupuestoTotal / total : 0;
    
    return {
      total,
      activas,
      inactivas: total - activas,
      posibles,
      imposibles,
      sinCalcular: total - (posibles + imposibles),
      presupuestoTotal: parseFloat(presupuestoTotal.toFixed(2)),
      presupuestoPromedio: parseFloat(presupuestoPromedio.toFixed(2)),
      porcentajeActivas: total > 0 ? ((activas / total) * 100).toFixed(2) : '0.00'
    };
  }

  async calcularEstrategiaDetallada(
    id: string, 
    options?: CalculoRequestDto
  ): Promise<ResultadoCalculoDto> {
    const estrategia = await this.estrategiaRepository
      .createQueryBuilder('estrategia')
      .leftJoinAndSelect('estrategia.demandas', 'demandas')
      .leftJoinAndSelect('demandas.producto', 'producto')
      .where('estrategia.id = :id', { id })
      .getOne();

    if (!estrategia) {
      throw new NotFoundException(`Estrategia con ID ${id} no encontrada`);
    }

    const resultadosProductos: ResultadoProducto[] = [];

    // Procesar cada demanda
    for (const demanda of estrategia.demandas || []) {
      const producto = demanda.producto;
      
      // Obtener recursos necesarios para este producto
      const relaciones = await this.relacionRepository
        .createQueryBuilder('relacion')
        .leftJoinAndSelect('relacion.recurso', 'recurso')
        .where('relacion.productoId = :productoId', { productoId: producto.id })
        .getMany();

      const recursosResultados: ResultadoRecurso[] = [];

      // Calcular cada recurso
      for (const relacion of relaciones) {
        const recurso = relacion.recurso;
        
        // Calcular cantidad total requerida
        const cantidadRequeridaTotal = relacion.cantidadRequerida * demanda.cantidadRequerida;
        
        // Obtener inventario disponible
        const inventarios = await this.inventarioRepository
          .createQueryBuilder('inventario')
          .leftJoinAndSelect('inventario.almacen', 'almacen')
          .where('inventario.recursoId = :recursoId', { recursoId: recurso.id })
          .andWhere('inventario.estado = :estado', { estado: 'disponible' })
          .getMany();

        // Filtrar almacenes si es necesario
        let inventariosFiltrados = inventarios;
        if (options && options.usarAlmacenesNoTocar === false) {
          // Si usarAlmacenesNoTocar es false, excluir almacenes con estado 'no_tocar'
          inventariosFiltrados = inventarios.filter(inv => inv.almacen.estado !== 'no_tocar');
        }

        // Calcular existencia total
        const existenciaTotal = inventariosFiltrados.reduce(
          (sum, inv) => sum + inv.cantidadDisponible, 
          0
        );

        // Determinar si es satisfacible
        const esSatisfacible = existenciaTotal >= cantidadRequeridaTotal;
        const deficit = esSatisfacible ? 0 : cantidadRequeridaTotal - existenciaTotal;

        // Formatear detalles de inventario
        const inventariosDetalle: InventarioDetalle[] = inventariosFiltrados.map(inv => ({
          almacen: inv.almacen.nombre,
          lote: inv.lote.toString(),
          fabricante: inv.fabricante,
          fechaFabricacion: inv.fechaFabricacion,
          fechaCaducidad: inv.fechaCaducidad,
          cantidad: inv.cantidadDisponible,
          unidadMedida: recurso.unidadMedida,
        }));

        recursosResultados.push({
          recursoId: recurso.id,
          nombre: recurso.nombre,
          tipoRecurso: recurso.tipoRecurso,
          unidadMedida: recurso.unidadMedida,
          criterioRelacion: recurso.criterioRelacion,
          cantidadRequerida: cantidadRequeridaTotal,
          existenciaInventario: existenciaTotal,
          esSatisfacible,
          deficit: !esSatisfacible ? deficit : undefined,
          inventarios: inventariosDetalle,
        });
      }

      // Determinar si el producto completo es satisfacible
      const productoEsSatisfacible = recursosResultados.every(r => r.esSatisfacible);

      resultadosProductos.push({
        productoId: producto.id,
        nombreProducto: producto.nombre,
        demanda: demanda.cantidadRequerida,
        recursos: recursosResultados,
        esSatisfacible: productoEsSatisfacible,
      });
    }

    // Determinar resultado general
    const todosSatisfacibles = resultadosProductos.every(p => p.esSatisfacible);
    const algunosSatisfacibles = resultadosProductos.some(p => p.esSatisfacible);
    
    let resultadoGeneral = 'insatisfacible';
    if (todosSatisfacibles) {
      resultadoGeneral = 'satisfacible';
    } else if (algunosSatisfacibles) {
      resultadoGeneral = 'parcial';
    }

    // Calcular presupuesto
    const presupuestoUtilizado = await this.calcularPresupuestoSimple(resultadosProductos);

    // Guardar en base de datos
    await this.guardarCalculoEnBD(estrategia.id, resultadosProductos, resultadoGeneral, presupuestoUtilizado);

    // Actualizar resultado en estrategia
    await this.estrategiaRepository.update(id, { resultadoCalculo: resultadoGeneral });

    return {
      estrategiaId: estrategia.id,
      nombreEstrategia: estrategia.nombre,
      resultadoGeneral,
      presupuestoUtilizado,
      fechaCalculo: new Date(),
      productos: resultadosProductos,
    };
  }

  private async cambiarEstado(id: string, nuevoEstado: string): Promise<EstrategiaDto> {
    const estrategia = await this.estrategiaRepository.findOne({ where: { id } });
    
    if (!estrategia) {
      throw new NotFoundException(`Estrategia con ID ${id} no encontrada`);
    }

    estrategia.estado = nuevoEstado;
    const updatedEstrategia = await this.estrategiaRepository.save(estrategia);
    return this.mapToDto(updatedEstrategia);
  }

  private async calcularPresupuestoSimple(resultadosProductos: ResultadoProducto[]): Promise<number> {
    // Implementa tu lógica de cálculo de presupuesto aquí
    // Por ahora retorna 0 como ejemplo
    return 0;
  }

  private async guardarCalculoEnBD(
    estrategiaId: string,
    resultadosProductos: ResultadoProducto[],
    resultadoGeneral: string,
    presupuestoUtilizado: number,
  ): Promise<void> {
    const calculo = this.calculoRepository.create({
      estrategia: { id: estrategiaId },
      resultadoGeneral,
      presupuestoUtilizado,
      observaciones: `Cálculo realizado el ${new Date().toISOString()}`,
    });

    const calculoGuardado = await this.calculoRepository.save(calculo);

    // Guardar detalles por recurso
    for (const productoResultado of resultadosProductos) {
      for (const recursoResultado of productoResultado.recursos) {
        const detalle = this.detalleCalculoRepository.create({
          calculo: calculoGuardado,
          recurso: { id: recursoResultado.recursoId },
          producto: { id: productoResultado.productoId },
          cantidadRequeridaTotal: recursoResultado.cantidadRequerida,
          cantidadDisponibleTotal: recursoResultado.existenciaInventario,
          esSatisfacible: recursoResultado.esSatisfacible,
          deficit: recursoResultado.deficit,
        });

        await this.detalleCalculoRepository.save(detalle);
      }
    }
  }

  private mapToDto(estrategia: Estrategia): EstrategiaDto {
    return {
      id: estrategia.id,
      nombre: estrategia.nombre,
      descripcion: estrategia.descripcion || '',
      fechaCreacion: estrategia.fechaCreacion,
      presupuestoMaximo: estrategia.presupuestoMaximo,
      estado: estrategia.estado,
      resultadoCalculo: estrategia.resultadoCalculo,
    };
  }

  async calcularViabilidadEstrategiaSencilla(estrategiaId: string): Promise<{
    estrategiaId: string;
    nombreEstrategia: string;
    esViable: boolean;
    productosSatisfacibles: string[];
    productosNoSatisfacibles: string[];
  }> {
  // Obtener la estrategia y sus demandas
  const estrategia = await this.estrategiaRepository.findOne({
    where: { id: estrategiaId },
    relations: ['demandas', 'demandas.producto'],
  });

  if (!estrategia) {
    throw new NotFoundException(`Estrategia con ID ${estrategiaId} no encontrada`);
  }

  const resultadosProductos: { productoId: string; esSatisfacible: boolean }[] = [];

  // Evaluar cada producto en la estrategia
  for (const demanda of estrategia.demandas) {
    const producto = demanda.producto;
    // Obtener las relaciones entre el producto y los recursos
    const relaciones = await this.relacionRepository.find({
      where: { productoId: producto.id },
      relations: ['recurso'],
    });

    let productoEsSatisfacible = true;

    // Verificar cada recurso necesario para el producto
    for (const relacion of relaciones) {
      const recurso = relacion.recurso;
      const cantidadRequeridaTotal = relacion.cantidadRequerida * demanda.cantidadRequerida;
      // Obtener la existencia total del recurso en el inventario
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

  // Evaluar la viabilidad de la estrategia
  const estrategiaEsViable = resultadosProductos.every(p => p.esSatisfacible);

  // Separar productos satisfacibles y no satisfacibles
  const productosSatisfacibles = resultadosProductos
    .filter(p => p.esSatisfacible)
    .map(p => p.productoId);

  const productosNoSatisfacibles = resultadosProductos
    .filter(p => !p.esSatisfacible)
    .map(p => p.productoId);

  // Devolver el resultado
  return {
    estrategiaId: estrategia.id,
    nombreEstrategia: estrategia.nombre,
    esViable: estrategiaEsViable,
    productosSatisfacibles,
    productosNoSatisfacibles,
  };
}


async obtenerExistenciaTotalRecurso(recursoId: string): Promise<number> {
  const inventarios = await this.inventarioRepository.find({
    where: { recursoId, estado: 'disponible' },
  });

  return inventarios.reduce((total, inventario) => total + inventario.cantidadDisponible, 0);
}



}