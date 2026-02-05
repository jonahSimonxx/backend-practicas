import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CalculoEstrategia } from './ENTITY/CalculoEstrategia.entity';
import { CreateCalculoEstrategiaDto } from './DTOS/CreateCalculoEstrategiaDto';
import { UpdateCalculoEstrategiaDto } from './DTOS/UpdateCalculoEstrategiaDto';
import { CalculoEstrategiaDto } from './DTOS/CalculoEstrategiaDto';

@Injectable()
export class CalculoEstrategiaService {
  constructor(
    @InjectRepository(CalculoEstrategia)
    private calculoEstrategiaRepository: Repository<CalculoEstrategia>,
  ) {}

  async create(createCalculoEstrategiaDto: CreateCalculoEstrategiaDto): Promise<CalculoEstrategiaDto> {
    // Verificar si ya existe un cálculo con ese ID
    const existente = await this.calculoEstrategiaRepository.findOne({
      where: { id: createCalculoEstrategiaDto.id }
    });

    if (existente) {
      throw new ConflictException(`Ya existe un cálculo con ID ${createCalculoEstrategiaDto.id}`);
    }

    // Validar que la suma no exceda límites razonables
    this.validarPresupuesto(
      createCalculoEstrategiaDto.presupuestoUtilizado,
      createCalculoEstrategiaDto.presupuestoDisponible
    );

    const calculo = this.calculoEstrategiaRepository.create(createCalculoEstrategiaDto);
    const savedCalculo = await this.calculoEstrategiaRepository.save(calculo);
    return this.mapToDto(savedCalculo);
  }

  async findAll(): Promise<CalculoEstrategiaDto[]> {
    const calculos = await this.calculoEstrategiaRepository.find({
      order: { fechaCalculo: 'DESC' }
    });
    return calculos.map(calculo => this.mapToDto(calculo));
  }

  async findOne(id: string): Promise<CalculoEstrategiaDto> {
    const calculo = await this.calculoEstrategiaRepository.findOne({
      where: { id }
    });

    if (!calculo) {
      throw new NotFoundException(`Cálculo con ID ${id} no encontrado`);
    }

    return this.mapToDto(calculo);
  }

  async findByEstrategia(estrategiaId: string): Promise<CalculoEstrategiaDto[]> {
    const calculos = await this.calculoEstrategiaRepository.find({
      where: { estrategiaId },
      order: { fechaCalculo: 'DESC' }
    });
    return calculos.map(calculo => this.mapToDto(calculo));
  }

  async findByResultado(resultadoGeneral: string): Promise<CalculoEstrategiaDto[]> {
    const calculos = await this.calculoEstrategiaRepository.find({
      where: { resultadoGeneral },
      order: { fechaCalculo: 'DESC' }
    });
    return calculos.map(calculo => this.mapToDto(calculo));
  }

  async findLatestByEstrategia(estrategiaId: string): Promise<CalculoEstrategiaDto> {
    const calculo = await this.calculoEstrategiaRepository.findOne({
      where: { estrategiaId },
      order: { fechaCalculo: 'DESC' }
    });

    if (!calculo) {
      throw new NotFoundException(`No se encontraron cálculos para la estrategia ${estrategiaId}`);
    }

    return this.mapToDto(calculo);
  }

  async update(id: string, updateCalculoEstrategiaDto: UpdateCalculoEstrategiaDto): Promise<CalculoEstrategiaDto> {
    const calculo = await this.calculoEstrategiaRepository.findOne({ where: { id } });
    
    if (!calculo) {
      throw new NotFoundException(`Cálculo con ID ${id} no encontrado`);
    }

    // No permitir modificar el ID
    if (updateCalculoEstrategiaDto.id && updateCalculoEstrategiaDto.id !== id) {
      throw new ConflictException('No se puede modificar el ID de un cálculo');
    }

    // Validar presupuesto si se actualiza
    if (updateCalculoEstrategiaDto.presupuestoUtilizado !== undefined || 
        updateCalculoEstrategiaDto.presupuestoDisponible !== undefined) {
      
      const nuevoUtilizado = updateCalculoEstrategiaDto.presupuestoUtilizado ?? calculo.presupuestoUtilizado;
      const nuevoDisponible = updateCalculoEstrategiaDto.presupuestoDisponible ?? calculo.presupuestoDisponible;
      
      this.validarPresupuesto(nuevoUtilizado, nuevoDisponible);
    }

    Object.assign(calculo, updateCalculoEstrategiaDto);
    const updatedCalculo = await this.calculoEstrategiaRepository.save(calculo);
    return this.mapToDto(updatedCalculo);
  }

  async remove(id: string): Promise<void> {
    const calculo = await this.calculoEstrategiaRepository.findOne({ where: { id } });

    if (!calculo) {
      throw new NotFoundException(`Cálculo con ID ${id} no encontrado`);
    }

    // FUTURO: Validar que no tenga detalles de recursos
    // if (calculo.detallesRecursos && calculo.detallesRecursos.length > 0) {
    //   throw new ConflictException(`No se puede eliminar el cálculo ${id} porque tiene detalles de recursos`);
    // }

    const result = await this.calculoEstrategiaRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Cálculo con ID ${id} no encontrado`);
    }
  }

  async getEstadisticasPorEstrategia(estrategiaId: string): Promise<any> {
    const calculos = await this.findByEstrategia(estrategiaId);
    
    if (calculos.length === 0) {
      return {
        estrategiaId,
        totalCalculos: 0,
        promedioEficiencia: 0,
        ultimoResultado: null,
        tendencia: 'sin datos'
      };
    }


  private validarPresupuesto(presupuestoUtilizado: number, presupuestoDisponible: number): void {
    if (presupuestoUtilizado < 0 || presupuestoDisponible < 0) {
      throw new BadRequestException('Los valores de presupuesto no pueden ser negativos');
    }

    const total = presupuestoUtilizado + presupuestoDisponible;
    if (total > 100000000) { 
      throw new BadRequestException('El presupuesto total excede el límite permitido');
    }
  }

  private mapToDto(calculo: CalculoEstrategia): CalculoEstrategiaDto {
    return {
      id: calculo.id,
      estrategiaId: calculo.estrategiaId,
      fechaCalculo: calculo.fechaCalculo,
      resultadoGeneral: calculo.resultadoGeneral,
      presupuestoUtilizado: calculo.presupuestoUtilizado,
      presupuestoDisponible: calculo.presupuestoDisponible,
      observaciones: calculo.observaciones || '',
    };
  }
}