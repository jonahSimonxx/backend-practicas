import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Almacen } from './ENTITY/Almacen.entity';
import { CreateAlmacenDto } from './DTOS/CreateAlmacenDto';
import { UpdateAlmacenDto } from './DTOS/UpdateAlmacenDto';
import { AlmacenDto } from './DTOS/AlmacenDto';

@Injectable()
export class AlmacenService {
  constructor(
    @InjectRepository(Almacen)
    private almacenRepository: Repository<Almacen>,
  ) {}

  async create(createAlmacenDto: CreateAlmacenDto): Promise<AlmacenDto> {
    // Verificar si ya existe un almacén con ese ID
    const existente = await this.almacenRepository.findOne({
      where: { id: createAlmacenDto.id }
    });

    if (existente) {
      throw new ConflictException(`Ya existe un almacén con ID ${createAlmacenDto.id}`);
    }

    // Crear y guardar
    const almacen = this.almacenRepository.create(createAlmacenDto);
    const savedAlmacen = await this.almacenRepository.save(almacen);
    
    return this.mapToDto(savedAlmacen);
  }

  async findAll(): Promise<AlmacenDto[]> {
    const almacenes = await this.almacenRepository.find({
      // relations: ['inventarios'], // Agregar cuando tengas la relación
      order: { nombre: 'ASC' }
    });
    
    return almacenes.map(almacen => this.mapToDto(almacen));
  }

  async findOne(id: string): Promise<AlmacenDto> {
    const almacen = await this.almacenRepository.findOne({
      where: { id },
      // relations: ['inventarios'],
    });

    if (!almacen) {
      throw new NotFoundException(`Almacén con ID ${id} no encontrado`);
    }

    return this.mapToDto(almacen);
  }

  async findByEstado(estado: string): Promise<AlmacenDto[]> {
    const almacenes = await this.almacenRepository.find({
      where: { estado },
      order: { nombre: 'ASC' }
    });
    
    return almacenes.map(almacen => this.mapToDto(almacen));
  }

  async findByTipo(tipoAlmacen: string): Promise<AlmacenDto[]> {
    const almacenes = await this.almacenRepository.find({
      where: { tipoAlmacen },
      order: { nombre: 'ASC' }
    });
    
    return almacenes.map(almacen => this.mapToDto(almacen));
  }

  async update(id: string, updateAlmacenDto: UpdateAlmacenDto): Promise<AlmacenDto> {
    const almacen = await this.almacenRepository.findOne({ where: { id } });
    
    if (!almacen) {
      throw new NotFoundException(`Almacén con ID ${id} no encontrado`);
    }

    // No permitir modificar el ID
    if (updateAlmacenDto.id && updateAlmacenDto.id !== id) {
      throw new ConflictException('No se puede modificar el ID de un almacén');
    }

    // Actualizar campos
    Object.assign(almacen, updateAlmacenDto);
    const updatedAlmacen = await this.almacenRepository.save(almacen);
    
    return this.mapToDto(updatedAlmacen);
  }

  async remove(id: string): Promise<void> {
    // Verificar si tiene inventarios asociados antes de eliminar
    const almacen = await this.almacenRepository.findOne({
      where: { id },
      // relations: ['inventarios']
    });

    if (!almacen) {
      throw new NotFoundException(`Almacén con ID ${id} no encontrado`);
    }

    // Validar que no tenga inventarios (cuando tengas la relación)
    // if (almacen.inventarios && almacen.inventarios.length > 0) {
    //   throw new ConflictException(
    //     `No se puede eliminar el almacén ${id} porque tiene ${almacen.inventarios.length} inventarios asociados`
    //   );
    // }

    const result = await this.almacenRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Almacén con ID ${id} no encontrado`);
    }
  }

  async activarAlmacen(id: string): Promise<AlmacenDto> {
    return this.cambiarEstado(id, 'activo');
  }

  async desactivarAlmacen(id: string): Promise<AlmacenDto> {
    return this.cambiarEstado(id, 'inactivo');
  }

  private async cambiarEstado(id: string, nuevoEstado: string): Promise<AlmacenDto> {
    const almacen = await this.almacenRepository.findOne({ where: { id } });
    
    if (!almacen) {
      throw new NotFoundException(`Almacén con ID ${id} no encontrado`);
    }

    almacen.estado = nuevoEstado;
    const updatedAlmacen = await this.almacenRepository.save(almacen);
    
    return this.mapToDto(updatedAlmacen);
  }

  private mapToDto(almacen: Almacen): AlmacenDto {
    return {
      id: almacen.id,
      nombre: almacen.nombre,
      ubicacion: almacen.ubicacion,
      tipoAlmacen: almacen.tipoAlmacen,
      estado: almacen.estado,
    };
  }
}