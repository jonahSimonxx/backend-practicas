import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Estrategia } from './ENTITY/Estrategia.entity';
import { CreateEstrategiaDto } from './DTOS/CreateEstrategiaDto';
import { UpdateEstrategiaDto } from './DTOS/UpdateEstrategiaDto';
import { EstrategiaDto } from './DTOS/EstrategiaDto';

@Injectable()
export class EstrategiaService {
  constructor(
    @InjectRepository(Estrategia)
    private estrategiaRepository: Repository<Estrategia>,
  ) {}

  async findAll(): Promise<EstrategiaDto[]> {
    const estrategias = await this.estrategiaRepository.find({
      // relations: ['demandas', 'calculos'], // FUTURO
      order: { fechaCreacion: 'DESC' }
    });
    return estrategias.map(estrategia => this.mapToDto(estrategia));
  }

  async findOne(id: string): Promise<EstrategiaDto> { // CORREGIDO: id es string
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

  async update(id: string, updateEstrategiaDto: UpdateEstrategiaDto): Promise<EstrategiaDto> { // CORREGIDO: id es string
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

  async remove(id: string): Promise<void> { // CORREGIDO: id es string
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

  private async cambiarEstado(id: string, nuevoEstado: string): Promise<EstrategiaDto> {
    const estrategia = await this.estrategiaRepository.findOne({ where: { id } });
    
    if (!estrategia) {
      throw new NotFoundException(`Estrategia con ID ${id} no encontrada`);
    }

    estrategia.estado = nuevoEstado;
    const updatedEstrategia = await this.estrategiaRepository.save(estrategia);
    return this.mapToDto(updatedEstrategia);
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
}