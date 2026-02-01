import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Estrategia } from './ENTITY/Estrategia.entity';
import { CreateEstrategiaDto } from './DTOS/CreateEstrategiaDto';
import { UpdateEstrategiaDto } from './DTOS/UpdateEstrategiaDto';
import { EstrategiaDto } from './DTOS/EstrategiaDto';

@Injectable()
export class EstrategiasService {
  constructor(
    @InjectRepository(Estrategia)
    private estrategiaRepository: Repository<Estrategia>,
  ) {}

  async create(createEstrategiaDto: CreateEstrategiaDto): Promise<EstrategiaDto> {
    const estrategia = this.estrategiaRepository.create(createEstrategiaDto);
    const savedEstrategia = await this.estrategiaRepository.save(estrategia);
    return this.mapToDto(savedEstrategia);
  }

  async findAll(): Promise<EstrategiaDto[]> {
    const estrategias = await this.estrategiaRepository.find({
      relations: ['demandas'],
      order: { fechaCreacion: 'DESC' }
    });
    return estrategias.map(estrategia => this.mapToDto(estrategia));
  }

  async findOne(id: number): Promise<EstrategiaDto> {
    const estrategia = await this.estrategiaRepository.findOne({
      where: { id },
      relations: ['demandas', 'calculos']
    });

    if (!estrategia) {
      throw new NotFoundException(`Estrategia con ID ${id} no encontrada`);
    }

    return this.mapToDto(estrategia);
  }

  async update(id: number, updateEstrategiaDto: UpdateEstrategiaDto): Promise<EstrategiaDto> {
    const estrategia = await this.estrategiaRepository.findOne({ where: { id } });
    
    if (!estrategia) {
      throw new NotFoundException(`Estrategia con ID ${id} no encontrada`);
    }

    Object.assign(estrategia, updateEstrategiaDto);
    const updatedEstrategia = await this.estrategiaRepository.save(estrategia);
    return this.mapToDto(updatedEstrategia);
  }

  async remove(id: number): Promise<void> {
    const result = await this.estrategiaRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Estrategia con ID ${id} no encontrada`);
    }
  }

  async calcularEstrategia(id: number): Promise<EstrategiaDto> {
    const estrategia = await this.estrategiaRepository.findOne({
      where: { id },
      relations: ['demandas', 'demandas.producto']
    });

    if (!estrategia) {
      throw new NotFoundException(`Estrategia con ID ${id} no encontrada`);
    }

    // Aquí implementarías la lógica de cálculo
    // Por ahora, solo actualizamos el resultado
    estrategia.resultadoCalculo = 'parcial'; // Esto sería dinámico
    
    const updatedEstrategia = await this.estrategiaRepository.save(estrategia);
    return this.mapToDto(updatedEstrategia);
  }

  private mapToDto(estrategia: Estrategia): EstrategiaDto {
    return {
      id: estrategia.id,
      nombre: estrategia.nombre,
      descripcion: estrategia.descripcion,
      fechaCreacion: estrategia.fechaCreacion,
      presupuestoMaximo: estrategia.presupuestoMaximo,
      estado: estrategia.estado,
      resultadoCalculo: estrategia.resultadoCalculo,
     // totalDemandado: estrategia.getTotalDemandado(),
     // cantidadDemandas: estrategia.demandas?.length || 0
    };
  }
}