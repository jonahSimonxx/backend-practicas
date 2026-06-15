import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CalculoEstrategia } from '../../CalculoEstrategia/ENTITY/CalculoEstrategia.entity';
import { ICalculoEstrategiaRepository } from '../INTERFACES/ICalculoEstrategiaRepository';

/**
 * Implementación concreta del repositorio de CalculoEstrategia sobre TypeORM.
 */
@Injectable()
export class CalculoEstrategiaRepository implements ICalculoEstrategiaRepository {
  constructor(
    @InjectRepository(CalculoEstrategia)
    private readonly repository: Repository<CalculoEstrategia>,
  ) {}

  crear(data: Partial<CalculoEstrategia>): CalculoEstrategia {
    return this.repository.create(data);
  }

  guardar(calculo: CalculoEstrategia): Promise<CalculoEstrategia> {
    return this.repository.save(calculo);
  }

  buscarTodos(): Promise<CalculoEstrategia[]> {
    return this.repository.find({ order: { fechaCalculo: 'DESC' } });
  }

  buscarPorId(id: string): Promise<CalculoEstrategia | null> {
    return this.repository.findOne({ where: { id } });
  }

  buscarPorEstrategia(estrategiaId: string): Promise<CalculoEstrategia[]> {
    return this.repository.find({
      where: { estrategiaId },
      order: { fechaCalculo: 'DESC' },
    });
  }

  buscarPorResultado(resultadoGeneral: string): Promise<CalculoEstrategia[]> {
    return this.repository.find({
      where: { resultadoGeneral },
      order: { fechaCalculo: 'DESC' },
    });
  }

  buscarUltimoPorEstrategia(estrategiaId: string): Promise<CalculoEstrategia | null> {
    return this.repository.findOne({
      where: { estrategiaId },
      order: { fechaCalculo: 'DESC' },
    });
  }

  async eliminar(id: string): Promise<number> {
    const result = await this.repository.delete(id);
    return result.affected ?? 0;
  }
}
