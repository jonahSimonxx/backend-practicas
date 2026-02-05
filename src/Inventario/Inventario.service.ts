import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual } from 'typeorm';
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

  async create(createInventarioDto: CreateInventarioDto): Promise<InventarioDto> {
    // Verificar si ya existe un inventario con ese ID
    const existente = await this.inventarioRepository.findOne({
      where: { id: createInventarioDto.id }
    });

    if (existente) {
      throw new ConflictException(`Ya existe un inventario con ID ${createInventarioDto.id}`);
    }

    // Validar que la fecha de caducidad sea posterior a la de fabricación
    if (createInventarioDto.fechaCaducidad && 
        createInventarioDto.fechaCaducidad < createInventarioDto.fechaFabricacion) {
      throw new BadRequestException('La fecha de caducidad debe ser posterior a la fecha de fabricación');
    }

    // Validar que no haya un lote duplicado para el mismo recurso y almacén
    const loteExistente = await this.inventarioRepository.findOne({
      where: {
        recursoId: createInventarioDto.recursoId,
        almacenId: createInventarioDto.almacenId,
        lote: createInventarioDto.lote
      }
    });

    if (loteExistente) {
      throw new ConflictException(`Ya existe un lote ${createInventarioDto.lote} para este recurso y almacén`);
    }

    const inventario = this.inventarioRepository.create(createInventarioDto);
    const savedInventario = await this.inventarioRepository.save(inventario);
    return this.mapToDto(savedInventario);
  }

  async findAll(): Promise<InventarioDto[]> {
    const inventarios = await this.inventarioRepository.find({
      order: { fechaFabricacion: 'DESC' }
    });
    return inventarios.map(inventario => this.mapToDto(inventario));
  }

  async findOne(id: string): Promise<InventarioDto> {
    const inventario = await this.inventarioRepository.findOne({
      where: { id }
    });

    if (!inventario) {
      throw new NotFoundException(`Inventario con ID ${id} no encontrado`);
    }

    return this.mapToDto(inventario);
  }

  async findByRecurso(recursoId: string): Promise<InventarioDto[]> {
    const inventarios = await this.inventarioRepository.find({
      where: { recursoId },
      order: { fechaFabricacion: 'DESC' }
    });
    return inventarios.map(inventario => this.mapToDto(inventario));
  }

  async findByAlmacen(almacenId: string): Promise<InventarioDto[]> {
    const inventarios = await this.inventarioRepository.find({
      where: { almacenId },
      order: { fechaFabricacion: 'DESC' }
    });
    return inventarios.map(inventario => this.mapToDto(inventario));
  }

  async findByEstado(estado: string): Promise<InventarioDto[]> {
    const inventarios = await this.inventarioRepository.find({
      where: { estado },
      order: { fechaFabricacion: 'DESC' }
    });
    return inventarios.map(inventario => this.mapToDto(inventario));
  }

  async findByFabricante(fabricante: string): Promise<InventarioDto[]> {
    const inventarios = await this.inventarioRepository
      .createQueryBuilder('inventario')
      .where('LOWER(inventario.fabricante) LIKE LOWER(:fabricante)', { 
        fabricante: `%${fabricante}%` 
      })
      .orderBy('inventario.fechaFabricacion', 'DESC')
      .getMany();
    
    return inventarios.map(inventario => this.mapToDto(inventario));
  }

  async findCaducados(): Promise<InventarioDto[]> {
    const hoy = new Date();
    const inventarios = await this.inventarioRepository.find({
      where: {
        fechaCaducidad: LessThanOrEqual(hoy)
      },
      order: { fechaCaducidad: 'ASC' }
    });
    return inventarios.map(inventario => this.mapToDto(inventario));
  }

  async findPorCaducar(dias: number = 30): Promise<InventarioDto[]> {
    const hoy = new Date();
    const fechaLimite = new Date();
    fechaLimite.setDate(hoy.getDate() + dias);
    
    const inventarios = await this.inventarioRepository.find({
      where: {
        fechaCaducidad: Between(hoy, fechaLimite)
      },
      order: { fechaCaducidad: 'ASC' }
    });
    return inventarios.map(inventario => this.mapToDto(inventario));
  }

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
    if (updateInventarioDto.fechaCaducidad && 
        updateInventarioDto.fechaCaducidad < inventario.fechaFabricacion) {
      throw new BadRequestException('La fecha de caducidad debe ser posterior a la fecha de fabricación');
    }

    Object.assign(inventario, updateInventarioDto);
    const updatedInventario = await this.inventarioRepository.save(inventario);
    return this.mapToDto(updatedInventario);
  }

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

  async reservar(id: string, cantidad: number): Promise<InventarioDto> {
    const inventario = await this.inventarioRepository.findOne({ where: { id } });
    
    if (!inventario) {
      throw new NotFoundException(`Inventario con ID ${id} no encontrado`);
    }

    if (inventario.estado !== 'disponible') {
      throw new BadRequestException(`El inventario ${id} no está disponible para reservar`);
    }

    if (inventario.cantidadDisponible < cantidad) {
      throw new BadRequestException(`Cantidad insuficiente. Disponible: ${inventario.cantidadDisponible}, Solicitado: ${cantidad}`);
    }

    inventario.cantidadDisponible -= cantidad;
    // Si se reserva todo, cambiar estado a reservado
    if (inventario.cantidadDisponible === 0) {
      inventario.estado = 'resarvado';
    }

    const updatedInventario = await this.inventarioRepository.save(inventario);
    return this.mapToDto(updatedInventario);
  }

  async liberar(id: string, cantidad: number): Promise<InventarioDto> {
    const inventario = await this.inventarioRepository.findOne({ where: { id } });
    
    if (!inventario) {
      throw new NotFoundException(`Inventario con ID ${id} no encontrado`);
    }

    inventario.cantidadDisponible += cantidad;
    inventario.estado = 'disponible'; // Siempre pasa a disponible al liberar

    const updatedInventario = await this.inventarioRepository.save(inventario);
    return this.mapToDto(updatedInventario);
  }

  async getTotalDisponiblePorRecurso(recursoId: string): Promise<number> {
    const inventarios = await this.findByRecurso(recursoId);
    return inventarios.reduce((total, inv) => total + inv.cantidadDisponible, 0);
  }

  async getEstadisticasAlmacen(almacenId: string): Promise<any> {
    const inventarios = await this.findByAlmacen(almacenId);
    
    if (inventarios.length === 0) {
      return {
        almacenId,
        totalInventarios: 0,
        cantidadCaducados: 0,
        cantidadPorCaducar: 0
      };
    }

    return {
      almacenId,
      totalInventarios: inventarios.length,
      porcentajeDisponible: ((inventarios.filter(inv => inv.estado === 'disponible').length / inventarios.length) * 100).toFixed(2)
    };
  }

  private mapToDto(inventario: Inventario): InventarioDto {
    const caducado = inventario.isCaducado();
    
    return {
      id: inventario.id,
      recursoId: inventario.recursoId,
      almacenId: inventario.almacenId,
      lote: inventario.lote,
      fabricante: inventario.fabricante,
      fechaFabricacion: inventario.fechaFabricacion,
      fechaCaducidad: inventario.fechaCaducidad,
      cantidadDisponible: inventario.cantidadDisponible,
      estado: inventario.estado
      // recursoNombre: inventario.recurso?.nombre, // FUTURO
      // almacenNombre: inventario.almacen?.nombre, // FUTURO
      // tipoRecurso: inventario.recurso?.tipoRecurso // FUTURO
    };
  }
}