import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recurso } from './ENTITY/Recurso.entity';
import { CreateRecursoDto } from './DTOS/CreateRecursoDto';
import { UpdateRecursoDto } from './DTOS/UpdateRecursoDto';
import { RecursoDto } from './DTOS/RecursoDto';

@Injectable()
export class RecursoService {
  constructor(
    @InjectRepository(Recurso)
    private recursoRepository: Repository<Recurso>,
  ) {}

  async create(createRecursoDto: CreateRecursoDto): Promise<RecursoDto> {
    // Verificar si ya existe un recurso con ese ID
    const existente = await this.recursoRepository.findOne({
      where: { id: createRecursoDto.id }
    });

    if (existente) {
      throw new ConflictException(`Ya existe un recurso con ID ${createRecursoDto.id}`);
    }

    const recurso = this.recursoRepository.create(createRecursoDto);
    const savedRecurso = await this.recursoRepository.save(recurso);
    return this.mapToDto(savedRecurso);
  }

  async findAll(): Promise<RecursoDto[]> {
    const recursos = await this.recursoRepository.find({
      order: { nombre: 'ASC' }
    });
    return recursos.map(recurso => this.mapToDto(recurso));
  }

  async findOne(id: string): Promise<RecursoDto> {
    const recurso = await this.recursoRepository.findOne({
      where: { id }
    });

    if (!recurso) {
      throw new NotFoundException(`Recurso con ID ${id} no encontrado`);
    }

    return this.mapToDto(recurso);
  }

  async findByTipoRecurso(tipoRecurso: string): Promise<RecursoDto[]> {
    const recursos = await this.recursoRepository.find({
      where: { tipoRecurso },
      order: { nombre: 'ASC' }
    });
    return recursos.map(recurso => this.mapToDto(recurso));
  }

  async update(id: string, updateRecursoDto: UpdateRecursoDto): Promise<RecursoDto> {
    const recurso = await this.recursoRepository.findOne({ where: { id } });
    
    if (!recurso) {
      throw new NotFoundException(`Recurso con ID ${id} no encontrado`);
    }

    // No permitir modificar el ID
    if (updateRecursoDto.id && updateRecursoDto.id !== id) {
      throw new ConflictException('No se puede modificar el ID de un recurso');
    }

    Object.assign(recurso, updateRecursoDto);
    const updatedRecurso = await this.recursoRepository.save(recurso);
    return this.mapToDto(updatedRecurso);
  }

  async remove(id: string): Promise<void> {
    const recurso = await this.recursoRepository.findOne({ where: { id } });

    if (!recurso) {
      throw new NotFoundException(`Recurso con ID ${id} no encontrado`);
    }

    // FUTURO: Validar que no tenga relaciones
    // if (recurso.relacionesProductos && recurso.relacionesProductos.length > 0) {
    //   throw new ConflictException(`No se puede eliminar el recurso ${id} porque tiene productos relacionados`);
    // }
    // if (recurso.inventarios && recurso.inventarios.length > 0) {
    //   throw new ConflictException(`No se puede eliminar el recurso ${id} porque tiene inventarios`);
    // }

    const result = await this.recursoRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Recurso con ID ${id} no encontrado`);
    }
  }

  async searchByNombre(nombre: string): Promise<RecursoDto[]> {
    const recursos = await this.recursoRepository
      .createQueryBuilder('recurso')
      .where('LOWER(recurso.nombre) LIKE LOWER(:nombre)', { nombre: `%${nombre}%` })
      .orderBy('recurso.nombre', 'ASC')
      .getMany();
    
    return recursos.map(recurso => this.mapToDto(recurso));
  }

  async getRecursosConBajoInventario(umbral: number = 10): Promise<RecursoDto[]> {
    // FUTURO: Implementar cuando tengas relaciones con Inventario
    // Por ahora devuelve todos
    const recursos = await this.recursoRepository.find({
      order: { nombre: 'ASC' }
    });
    
    return recursos.map(recurso => this.mapToDto(recurso));
  }

  private mapToDto(recurso: Recurso): RecursoDto {
    return {
      id: recurso.id,
      nombre: recurso.nombre,
      tipoRecurso: recurso.tipoRecurso,
      unidadMedida: recurso.unidadMedida,
      descripcion: recurso.descripcion || '',
    };
  }
}