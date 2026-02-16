import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventario } from './ENTITY/Inventario.entity';
import { CreateInventarioDto } from './DTOS/CreateInventarioDto';
import { UpdateInventarioDto } from './DTOS/UpdateInventarioDto';
import { InventarioDto } from './DTOS/InventarioDto';

@Injectable()
export class InventarioService {
  constructor(
    @InjectRepository(Inventario)
    private inventarioRepository: Repository<Inventario>,
  ) {}

  // Crea un nuevo inventario
  async create(createInventarioDto: CreateInventarioDto): Promise<InventarioDto> {
    const { lote, recursoId, almacenId, unidadMedida, areaAlmacenamiento } = createInventarioDto;

    // Validar que no exista un lote igual para el mismo recurso y almacén
    const existeLote = await this.inventarioRepository.findOne({
      where: { lote, recursoId, almacenId }
    });

    if (existeLote) {
      throw new ConflictException(`Ya existe un lote ${lote} para este recurso y almacén`);
    }

    // Validar que unidadMedida y areaAlmacenamiento no estén vacíos
    if (!unidadMedida || !areaAlmacenamiento) {
      throw new BadRequestException('La unidad de medida y el área de almacenamiento son obligatorios');
    }

    const inventario = this.inventarioRepository.create(createInventarioDto);
    const savedInventario = await this.inventarioRepository.save(inventario);
    return this.mapToDto(savedInventario);
  }

  // Lista todos los inventarios
  async findAll(): Promise<InventarioDto[]> {
    const inventarios = await this.inventarioRepository.find({
      order: { fechaFabricacion: 'DESC' }
    });
    return inventarios.map(inventario => this.mapToDto(inventario));
  }

  // Busca un inventario por ID
  async findOne(id: string): Promise<InventarioDto> {
    const inventario = await this.inventarioRepository.findOne({
      where: { id }
    });

    if (!inventario) {
      throw new NotFoundException(`Inventario con ID ${id} no encontrado`);
    }

    return this.mapToDto(inventario);
  }

  // Busca inventarios por recurso
  async findByRecurso(recursoId: string): Promise<InventarioDto[]> {
    const inventarios = await this.inventarioRepository.find({
      where: { recursoId },
      order: { fechaFabricacion: 'DESC' }
    });
    return inventarios.map(inventario => this.mapToDto(inventario));
  }

  // Busca inventarios por almacén
  async findByAlmacen(almacenId: string): Promise<InventarioDto[]> {
    const inventarios = await this.inventarioRepository.find({
      where: { almacenId },
      order: { fechaFabricacion: 'DESC' }
    });
    return inventarios.map(inventario => this.mapToDto(inventario));
  }

  // Busca inventarios por estado
  async findByEstado(estado: string): Promise<InventarioDto[]> {
    const inventarios = await this.inventarioRepository.find({
      where: { estado },
      order: { fechaFabricacion: 'DESC' }
    });
    return inventarios.map(inventario => this.mapToDto(inventario));
  }

  // Busca inventarios por fabricante
  async findByFabricante(fabricante: string): Promise<InventarioDto[]> {
    const inventarios = await this.inventarioRepository
      .createQueryBuilder('inventario')
      .where('LOWER(inventario.fabricante) LIKE LOWER(:fabricante)', {
        fabricante: `%${fabricante}%`
      })
      .getMany();
    return inventarios.map(inventario => this.mapToDto(inventario));
  }

  // Busca inventarios caducados
  async findCaducados(): Promise<InventarioDto[]> {
    const hoy = new Date();
    const inventarios = await this.inventarioRepository
      .createQueryBuilder('inventario')
      .where('inventario.fechaCaducidad < :hoy', { hoy })
      .getMany();
    return inventarios.map(inventario => this.mapToDto(inventario));
  }

  // Busca inventarios por caducar en X días
  async findPorCaducar(dias: number): Promise<InventarioDto[]> {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + dias);

    const inventarios = await this.inventarioRepository
      .createQueryBuilder('inventario')
      .where('inventario.fechaCaducidad BETWEEN :hoy AND :fechaLimite', {
        hoy: new Date(),
        fechaLimite
      })
      .getMany();
    return inventarios.map(inventario => this.mapToDto(inventario));
  }

  // Obtiene la disponibilidad total de un recurso
  async getTotalDisponiblePorRecurso(recursoId: string): Promise<number> {
    const inventarios = await this.inventarioRepository.find({
      where: { recursoId, estado: 'disponible' }
    });
    return inventarios.reduce((total, inventario) => total + inventario.cantidadDisponible, 0);
  }

  // Actualiza un inventario
  async update(id: string, updateInventarioDto: UpdateInventarioDto): Promise<InventarioDto> {
    const inventario = await this.inventarioRepository.findOne({ where: { id } });

    if (!inventario) {
      throw new NotFoundException(`Inventario con ID ${id} no encontrado`);
    }

    // No permitir modificar el ID
    if (updateInventarioDto.id && updateInventarioDto.id !== id) {
      throw new ConflictException('No se puede modificar el ID de un inventario');
    }

    // Validar fecha de caducidad si se actualiza
    if (updateInventarioDto.fechaCaducidad && updateInventarioDto.fechaCaducidad < inventario.fechaFabricacion) {
      throw new BadRequestException('La fecha de caducidad debe ser posterior a la fecha de fabricación');
    }

    // Validar fecha de vigencia si se actualiza
    if (updateInventarioDto.fechaVigencia && updateInventarioDto.fechaVigencia < inventario.fechaFabricacion) {
      throw new BadRequestException('La fecha de vigencia debe ser posterior a la fecha de fabricación');
    }

    // Validar que unidadMedida y areaAlmacenamiento no estén vacíos si se actualizan
    if (updateInventarioDto.unidadMedida && !updateInventarioDto.unidadMedida.trim()) {
      throw new BadRequestException('La unidad de medida no puede estar vacía');
    }
    if (updateInventarioDto.areaAlmacenamiento && !updateInventarioDto.areaAlmacenamiento.trim()) {
      throw new BadRequestException('El área de almacenamiento no puede estar vacía');
    }

    Object.assign(inventario, updateInventarioDto);
    const updatedInventario = await this.inventarioRepository.save(inventario);
    return this.mapToDto(updatedInventario);
  }

  // Elimina un inventario
  async remove(id: string): Promise<void> {
    const inventario = await this.inventarioRepository.findOne({ where: { id } });

    if (!inventario) {
      throw new NotFoundException(`Inventario con ID ${id} no encontrado`);
    }

    // No permitir eliminar inventarios con cantidad disponible
    if (inventario.cantidadDisponible > 0) {
      throw new ConflictException(`No se puede eliminar el inventario ${id} porque tiene cantidad disponible`);
    }

    const result = await this.inventarioRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Inventario con ID ${id} no encontrado`);
    }
  }

  // Mapea entidad a DTO
  private mapToDto(inventario: Inventario): InventarioDto {
    return {
      id: inventario.id,
      recursoId: inventario.recursoId,
      almacenId: inventario.almacenId,
      lote: inventario.lote,
      fabricante: inventario.fabricante,
      fechaFabricacion: inventario.fechaFabricacion,
      fechaCaducidad: inventario.fechaCaducidad,
      cantidadDisponible: inventario.cantidadDisponible,
      fechaVigencia: inventario.fechaVigencia,
      numeroMuestreo: inventario.numeroMuestreo,
      estado: inventario.estado,
      unidadMedida: inventario.unidadMedida,
      areaAlmacenamiento: inventario.areaAlmacenamiento,
    };
  }
}
