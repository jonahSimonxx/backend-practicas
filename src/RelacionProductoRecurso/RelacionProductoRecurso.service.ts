import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RelacionProductoRecurso } from './ENTITY/RelacionProductoRecurso.entity';
import { CreateRelacionProductoRecursoDto } from './DTOS/CreateRelacionProductoRecursoDto';
import { UpdateRelacionProductoRecursoDto } from './DTOS/UpdateRelacionProductoRecursoDto';
import { RelacionProductoRecursoDto } from './DTOS/RelacionProductoRecursoDto';

@Injectable()
export class RelacionProductoRecursoService {
  constructor(
    @InjectRepository(RelacionProductoRecurso)
    private relacionRepository: Repository<RelacionProductoRecurso>,
  ) {}

  async create(createRelacionDto: CreateRelacionProductoRecursoDto): Promise<RelacionProductoRecursoDto> {
    // Verificar si ya existe una relación con ese ID
    const existente = await this.relacionRepository.findOne({
      where: { id: createRelacionDto.id }
    });

    if (existente) {
      throw new ConflictException(`Ya existe una relación con ID ${createRelacionDto.id}`);
    }

    // Verificar si ya existe una relación para este producto y recurso
    const relacionExistente = await this.relacionRepository.findOne({
      where: {
        productoId: createRelacionDto.productoId,
        recursoId: createRelacionDto.recursoId
      }
    });

    if (relacionExistente) {
      throw new ConflictException(
        `Ya existe una relación entre el producto ${createRelacionDto.productoId} y el recurso ${createRelacionDto.recursoId}`
      );
    }

    // FUTURO: Verificar que existan Producto y Recurso
    // const productoExiste = await this.productoService.findOne(createRelacionDto.productoId);
    // const recursoExiste = await this.recursoService.findOne(createRelacionDto.recursoId);

    const relacion = this.relacionRepository.create(createRelacionDto);
    const savedRelacion = await this.relacionRepository.save(relacion);
    return this.mapToDto(savedRelacion);
  }

  async findAll(): Promise<RelacionProductoRecursoDto[]> {
    const relaciones = await this.relacionRepository.find({
      order: { productoId: 'ASC', recursoId: 'ASC' }
    });
    return relaciones.map(relacion => this.mapToDto(relacion));
  }

  async findOne(id: string): Promise<RelacionProductoRecursoDto> {
    const relacion = await this.relacionRepository.findOne({
      where: { id }
    });

    if (!relacion) {
      throw new NotFoundException(`Relación con ID ${id} no encontrada`);
    }

    return this.mapToDto(relacion);
  }

  async findByProducto(productoId: string): Promise<RelacionProductoRecursoDto[]> {
    const relaciones = await this.relacionRepository.find({
      where: { productoId },
      order: { cantidadRequerida: 'DESC' }
    });
    return relaciones.map(relacion => this.mapToDto(relacion));
  }

  async findByRecurso(recursoId: string): Promise<RelacionProductoRecursoDto[]> {
    const relaciones = await this.relacionRepository.find({
      where: { recursoId },
      order: { cantidadRequerida: 'DESC' }
    });
    return relaciones.map(relacion => this.mapToDto(relacion));
  }

  async findByTipoRelacion(tipoRelacion: string): Promise<RelacionProductoRecursoDto[]> {
    const relaciones = await this.relacionRepository.find({
      where: { tipoRelacion },
      order: { productoId: 'ASC' }
    });
    return relaciones.map(relacion => this.mapToDto(relacion));
  }

  async findByProductoYRecurso(productoId: string, recursoId: string): Promise<RelacionProductoRecursoDto | null> {
    const relacion = await this.relacionRepository.findOne({
      where: { productoId, recursoId }
    });

    if (!relacion) {
      return null;
    }

    return this.mapToDto(relacion);
  }

  async update(id: string, updateRelacionDto: UpdateRelacionProductoRecursoDto): Promise<RelacionProductoRecursoDto> {
    const relacion = await this.relacionRepository.findOne({ where: { id } });
    
    if (!relacion) {
      throw new NotFoundException(`Relación con ID ${id} no encontrada`);
    }

    // No permitir modificar el ID
    if (updateRelacionDto.id && updateRelacionDto.id !== id) {
      throw new ConflictException('No se puede modificar el ID de una relación');
    }

    // Si se cambia productoId o recursoId, verificar que no exista ya esa combinación
    if ((updateRelacionDto.productoId && updateRelacionDto.productoId !== relacion.productoId) ||
        (updateRelacionDto.recursoId && updateRelacionDto.recursoId !== relacion.recursoId)) {
      
      const nuevoProductoId = updateRelacionDto.productoId || relacion.productoId;
      const nuevoRecursoId = updateRelacionDto.recursoId || relacion.recursoId;
      
      const relacionExistente = await this.relacionRepository.findOne({
        where: {
          productoId: nuevoProductoId,
          recursoId: nuevoRecursoId
        }
      });

      if (relacionExistente && relacionExistente.id !== id) {
        throw new ConflictException(
          `Ya existe una relación entre el producto ${nuevoProductoId} y el recurso ${nuevoRecursoId}`
        );
      }
    }

    Object.assign(relacion, updateRelacionDto);
    const updatedRelacion = await this.relacionRepository.save(relacion);
    return this.mapToDto(updatedRelacion);
  }

  async remove(id: string): Promise<void> {
    const relacion = await this.relacionRepository.findOne({ where: { id } });

    if (!relacion) {
      throw new NotFoundException(`Relación con ID ${id} no encontrada`);
    }

    const result = await this.relacionRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Relación con ID ${id} no encontrada`);
    }
  }

  async getRequerimientosParaProducto(productoId: string, cantidad: number): Promise<any> {
    const relaciones = await this.findByProducto(productoId);
    
    const requerimientos = relaciones.map(relacion => ({
      recursoId: relacion.recursoId,
      cantidadRequeridaPorUnidad: relacion.cantidadRequerida,
      cantidadTotalRequerida: relacion.cantidadRequerida * cantidad,
      tipoRelacion: relacion.tipoRelacion
    }));

    return {
      productoId,
      cantidadSolicitada: cantidad,
      totalRecursos: relaciones.length,
      requerimientos,
      totalConsumo: requerimientos
        .filter(r => r.tipoRelacion === 'consumo')
        .reduce((sum, r) => sum + r.cantidadTotalRequerida, 0),
      totalProduccion: requerimientos
        .filter(r => r.tipoRelacion === 'producción')
        .reduce((sum, r) => sum + r.cantidadTotalRequerida, 0)
    };
  }

  async getRecursosMasUtilizados(limit: number = 10): Promise<any[]> {
    const relaciones = await this.relacionRepository
      .createQueryBuilder('relacion')
      .select('relacion.recursoId, COUNT(*) as usos, SUM(relacion.cantidadRequerida) as totalRequerido')
      .groupBy('relacion.recursoId')
      .orderBy('usos', 'DESC')
      .limit(limit)
      .getRawMany();

    return relaciones;
  }

  private mapToDto(relacion: RelacionProductoRecurso): RelacionProductoRecursoDto {
    return {
      id: relacion.id,
      productoId: relacion.productoId,
      recursoId: relacion.recursoId,
      cantidadRequerida: relacion.cantidadRequerida,
      tipoRelacion: relacion.tipoRelacion
    };
  }
}