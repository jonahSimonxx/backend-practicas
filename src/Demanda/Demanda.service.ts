import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Demanda } from './ENTITY/Demanda.entity';
import { CreateDemandaDto } from './DTOS/CreateDemandaDto';
import { UpdateDemandaDto } from './DTOS/UpdateDemandaDto';
import { DemandaDto } from './DTOS/DemandaDto';

@Injectable()
export class DemandaService {
  constructor(
    @InjectRepository(Demanda)
    private demandaRepository: Repository<Demanda>,
  ) {}

  async create(createDemandaDto: CreateDemandaDto): Promise<DemandaDto> {
    // Verificar si ya existe una demanda con ese ID
    const existente = await this.demandaRepository.findOne({
      where: { id: createDemandaDto.id }
    });

    if (existente) {
      throw new ConflictException(`Ya existe una demanda con ID ${createDemandaDto.id}`);
    }

    // FUTURO: Verificar que existan Producto y Estrategia
    // const productoExiste = await this.productoService.findOne(createDemandaDto.productoId);
    // const estrategiaExiste = await this.estrategiaService.findOne(createDemandaDto.estrategiaId);

    const demanda = this.demandaRepository.create(createDemandaDto);
    const savedDemanda = await this.demandaRepository.save(demanda);
    return this.mapToDto(savedDemanda);
  }

  async findAll(): Promise<DemandaDto[]> {
    const demandas = await this.demandaRepository.find({
      order: { cantidadRequerida: 'DESC' }
    });
    return demandas.map(demanda => this.mapToDto(demanda));
  }

  async findOne(id: string): Promise<DemandaDto> {
    const demanda = await this.demandaRepository.findOne({
      where: { id }
    });

    if (!demanda) {
      throw new NotFoundException(`Demanda con ID ${id} no encontrada`);
    }

    return this.mapToDto(demanda);
  }

  async findByEstrategia(estrategiaId: string): Promise<DemandaDto[]> {
    const demandas = await this.demandaRepository.find({
      where: { estrategiaId },
      order: { cantidadRequerida: 'DESC' }
    });
    return demandas.map(demanda => this.mapToDto(demanda));
  }

  async findByProducto(productoId: string): Promise<DemandaDto[]> {
    const demandas = await this.demandaRepository.find({
      where: { productoId },
      order: { cantidadRequerida: 'DESC' }
    });
    return demandas.map(demanda => this.mapToDto(demanda));
  }

  async findByTipoDemanda(tipoDemanda: string): Promise<DemandaDto[]> {
    const demandas = await this.demandaRepository.find({
      where: { tipoDemanda },
      order: { cantidadRequerida: 'DESC' }
    });
    return demandas.map(demanda => this.mapToDto(demanda));
  }

  async findByPeriodo(periodo: string): Promise<DemandaDto[]> {
    const demandas = await this.demandaRepository.find({
      where: { periodo },
      order: { cantidadRequerida: 'DESC' }
    });
    return demandas.map(demanda => this.mapToDto(demanda));
  }

  async update(id: string, updateDemandaDto: UpdateDemandaDto): Promise<DemandaDto> {
    const demanda = await this.demandaRepository.findOne({ where: { id } });
    
    if (!demanda) {
      throw new NotFoundException(`Demanda con ID ${id} no encontrada`);
    }

    // No permitir modificar el ID
    if (updateDemandaDto.id && updateDemandaDto.id !== id) {
      throw new ConflictException('No se puede modificar el ID de una demanda');
    }

    // FUTURO: Si se actualiza productoId o estrategiaId, verificar que existan

    Object.assign(demanda, updateDemandaDto);
    const updatedDemanda = await this.demandaRepository.save(demanda);
    return this.mapToDto(updatedDemanda);
  }

  async remove(id: string): Promise<void> {
    const demanda = await this.demandaRepository.findOne({ where: { id } });

    if (!demanda) {
      throw new NotFoundException(`Demanda con ID ${id} no encontrada`);
    }

    const result = await this.demandaRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Demanda con ID ${id} no encontrada`);
    }
  }

  private mapToDto(demanda: Demanda): DemandaDto {
    
    return {
      id: demanda.id,
      productoId: demanda.productoId,
      estrategiaId: demanda.estrategiaId,
      tipoDemanda: demanda.tipoDemanda,
      cantidadRequerida: demanda.cantidadRequerida,
      periodo: demanda.periodo,
    };
  }
}