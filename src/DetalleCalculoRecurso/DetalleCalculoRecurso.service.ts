import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DetalleCalculoRecurso } from './ENTITY/DetalleCalculoRecurso.entity';
import { CreateDetalleCalculoRecursoDto } from './DTOS/CreateDetalleCalculoRecursoDto';
import { UpdateDetalleCalculoRecursoDto } from './DTOS/UpdateDetalleCalculoRecursoDto';
import { DetalleCalculoRecursoDto } from './DTOS/DetalleCalculoRecursoDto';

@Injectable()
export class DetalleCalculoRecursoService {
  constructor(
    @InjectRepository(DetalleCalculoRecurso)
    private detalleRepository: Repository<DetalleCalculoRecurso>,
  ) {}

  async create(createDetalleDto: CreateDetalleCalculoRecursoDto): Promise<DetalleCalculoRecursoDto> {
    // Verificar si ya existe un detalle con ese ID
    const existente = await this.detalleRepository.findOne({
      where: { id: createDetalleDto.id }
    });

    if (existente) {
      throw new ConflictException(`Ya existe un detalle con ID ${createDetalleDto.id}`);
    }

    // Verificar si ya existe un detalle para este cálculo y recurso
    const detalleExistente = await this.detalleRepository.findOne({
      where: {
        calculoId: createDetalleDto.calculoId,
        recursoId: createDetalleDto.recursoId
      }
    });

    if (detalleExistente) {
      throw new ConflictException(
        `Ya existe un detalle para el cálculo ${createDetalleDto.calculoId} y recurso ${createDetalleDto.recursoId}`
      );
    }

    // Validar que satisfacer sea consistente con las cantidades
    const satisfacerConsistente = 
      (createDetalleDto.cantidadDisponibleTotal >= createDetalleDto.cantidadRequeridaTotal) === 
      createDetalleDto.satisfacer;

    if (!satisfacerConsistente) {
      throw new ConflictException(
        'El campo "satisfacer" no es consistente con las cantidades proporcionadas'
      );
    }

    // FUTURO: Verificar que existan CalculoEstrategia y Recurso
    // const calculoExiste = await this.calculoService.findOne(createDetalleDto.calculoId);
    // const recursoExiste = await this.recursoService.findOne(createDetalleDto.recursoId);

    const detalle = this.detalleRepository.create(createDetalleDto);
    const savedDetalle = await this.detalleRepository.save(detalle);
    return this.mapToDto(savedDetalle);
  }

  async createBatch(detalles: CreateDetalleCalculoRecursoDto[]): Promise<DetalleCalculoRecursoDto[]> {
    const resultados: DetalleCalculoRecursoDto[] = [];
    
    for (const detalleDto of detalles) {
      try {
        const detalleCreado = await this.create(detalleDto);
        resultados.push(detalleCreado);
      } catch (error) {
        // Puedes decidir si quieres continuar con los demás o fallar todo
        throw error; // Por ahora fallamos al primer error
      }
    }
    
    return resultados;
  }

  async findAll(): Promise<DetalleCalculoRecursoDto[]> {
    const detalles = await this.detalleRepository.find({
      order: { calculoId: 'ASC', recursoId: 'ASC' }
    });
    return detalles.map(detalle => this.mapToDto(detalle));
  }

  async findOne(id: string): Promise<DetalleCalculoRecursoDto> {
    const detalle = await this.detalleRepository.findOne({
      where: { id }
    });

    if (!detalle) {
      throw new NotFoundException(`Detalle con ID ${id} no encontrado`);
    }

    return this.mapToDto(detalle);
  }

  async findByCalculo(calculoId: string): Promise<DetalleCalculoRecursoDto[]> {
    const detalles = await this.detalleRepository.find({
      where: { calculoId },
      order: { cantidadRequeridaTotal: 'DESC' }
    });
    return detalles.map(detalle => this.mapToDto(detalle));
  }

  async findByRecurso(recursoId: string): Promise<DetalleCalculoRecursoDto[]> {
    const detalles = await this.detalleRepository.find({
      where: { recursoId },
      order: { calculoId: 'ASC' }
    });
    return detalles.map(detalle => this.mapToDto(detalle));
  }

  async findBySatisfaccion(satisfacer: boolean): Promise<DetalleCalculoRecursoDto[]> {
    const detalles = await this.detalleRepository.find({
      where: { satisfacer },
      order: { calculoId: 'ASC' }
    });
    return detalles.map(detalle => this.mapToDto(detalle));
  }

  async findByCalculoYRecurso(calculoId: string, recursoId: string): Promise<DetalleCalculoRecursoDto | null> {
    const detalle = await this.detalleRepository.findOne({
      where: { calculoId, recursoId }
    });

    if (!detalle) {
      return null;
    }

    return this.mapToDto(detalle);
  }

  async update(id: string, updateDetalleDto: UpdateDetalleCalculoRecursoDto): Promise<DetalleCalculoRecursoDto> {
    const detalle = await this.detalleRepository.findOne({ where: { id } });
    
    if (!detalle) {
      throw new NotFoundException(`Detalle con ID ${id} no encontrado`);
    }

    // No permitir modificar el ID
    if (updateDetalleDto.id && updateDetalleDto.id !== id) {
      throw new ConflictException('No se puede modificar el ID de un detalle');
    }

    // Si se cambia calculoId o recursoId, verificar que no exista ya esa combinación
    if ((updateDetalleDto.calculoId && updateDetalleDto.calculoId !== detalle.calculoId) ||
        (updateDetalleDto.recursoId && updateDetalleDto.recursoId !== detalle.recursoId)) {
      
      const nuevoCalculoId = updateDetalleDto.calculoId || detalle.calculoId;
      const nuevoRecursoId = updateDetalleDto.recursoId || detalle.recursoId;
      
      const detalleExistente = await this.detalleRepository.findOne({
        where: {
          calculoId: nuevoCalculoId,
          recursoId: nuevoRecursoId
        }
      });

      if (detalleExistente && detalleExistente.id !== id) {
        throw new ConflictException(
          `Ya existe un detalle para el cálculo ${nuevoCalculoId} y recurso ${nuevoRecursoId}`
        );
      }
    }

    // Validar consistencia de satisfacer si se actualizan cantidades
    if (updateDetalleDto.cantidadRequeridaTotal !== undefined || 
        updateDetalleDto.cantidadDisponibleTotal !== undefined ||
        updateDetalleDto.satisfacer !== undefined) {
      
      const nuevaCantidadRequerida = updateDetalleDto.cantidadRequeridaTotal ?? detalle.cantidadRequeridaTotal;
      const nuevaCantidadDisponible = updateDetalleDto.cantidadDisponibleTotal ?? detalle.cantidadDisponibleTotal;
      const nuevoSatisfacer = updateDetalleDto.satisfacer ?? detalle.satisfacer;
      
      const satisfacerConsistente = 
        (nuevaCantidadDisponible >= nuevaCantidadRequerida) === nuevoSatisfacer;

      if (!satisfacerConsistente) {
        throw new ConflictException(
          'El campo "satisfacer" no es consistente con las cantidades proporcionadas'
        );
      }
    }

    Object.assign(detalle, updateDetalleDto);
    const updatedDetalle = await this.detalleRepository.save(detalle);
    return this.mapToDto(updatedDetalle);
  }

  async remove(id: string): Promise<void> {
    const detalle = await this.detalleRepository.findOne({ where: { id } });

    if (!detalle) {
      throw new NotFoundException(`Detalle con ID ${id} no encontrado`);
    }

    const result = await this.detalleRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Detalle con ID ${id} no encontrado`);
    }
  }

  async removeByCalculo(calculoId: string): Promise<number> {
    const result = await this.detalleRepository.delete({ calculoId });
    return result.affected || 0;
  }

  async getEstadisticasCalculo(calculoId: string): Promise<any> {
    const detalles = await this.findByCalculo(calculoId);
    
    if (detalles.length === 0) {
      return {
        calculoId,
        totalDetalles: 0,
        satisfacibles: 0,
        noSatisfacibles: 0,
        porcentajeSatisfaccion: 0,
        deficitTotal: 0
      };
    }

    const satisfacibles = detalles.filter(d => d.satisfacer).length;
    const porcentajeSatisfaccion = (satisfacibles / detalles.length) * 100;

    return {
      calculoId,
      totalDetalles: detalles.length,
      satisfacibles,
      noSatisfacibles: detalles.length - satisfacibles,
      porcentajeSatisfaccion: parseFloat(porcentajeSatisfaccion.toFixed(2)),
      recursosInvolucrados: [...new Set(detalles.map(d => d.recursoId))].length
    };
  }

  private mapToDto(detalle: DetalleCalculoRecurso): DetalleCalculoRecursoDto {
    const diferencia = detalle.getDiferencia();
    const porcentajeSatisfaccion = detalle.getPorcentajeSatisfaccion();
    const deficit = detalle.getDeficit();
    
    return {
      id: detalle.id,
      calculoId: detalle.calculoId,
      recursoId: detalle.recursoId,
      cantidadRequeridaTotal: detalle.cantidadRequeridaTotal,
      cantidadDisponibleTotal: detalle.cantidadDisponibleTotal,
      satisfacer: detalle.satisfacer
    };
  }
}