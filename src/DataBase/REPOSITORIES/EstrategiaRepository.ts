import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Estrategia } from '../../Estrategia/ENTITY/Estrategia.entity';
import { IEstrategiaRepository } from '../INTERFACES/IEstrategiaRepository';

/**
 * Implementación concreta del repositorio de Estrategia sobre TypeORM.
 *
 * Es el único punto del dominio que conoce `Repository<Estrategia>`; el resto
 * del código depende de la interfaz {@link IEstrategiaRepository}.
 */
@Injectable()
export class EstrategiaRepository implements IEstrategiaRepository {
  constructor(
    @InjectRepository(Estrategia)
    private readonly repository: Repository<Estrategia>,
  ) {}

  crear(data: Partial<Estrategia>): Estrategia {
    return this.repository.create(data);
  }

  guardar(estrategia: Estrategia): Promise<Estrategia> {
    return this.repository.save(estrategia);
  }

  buscarTodos(): Promise<Estrategia[]> {
    return this.repository.find({ order: { fechaCreacion: 'DESC' } });
  }

  buscarPorId(id: string): Promise<Estrategia | null> {
    return this.repository.findOne({ where: { id } });
  }

  buscarPorIdConRelaciones(id: string, relaciones: string[]): Promise<Estrategia | null> {
    return this.repository.findOne({ where: { id }, relations: relaciones });
  }

  buscarPorEstado(estado: string): Promise<Estrategia[]> {
    return this.repository.find({ where: { estado }, order: { nombre: 'ASC' } });
  }

  async actualizar(id: string, cambios: Partial<Estrategia>): Promise<void> {
    await this.repository.update(id, cambios);
  }

  async eliminar(id: string): Promise<number> {
    const result = await this.repository.delete(id);
    return result.affected ?? 0;
  }
}
