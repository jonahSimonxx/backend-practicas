import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RelacionProductoRecurso } from '../../RelacionProductoRecurso/ENTITY/RelacionProductoRecurso.entity';
import { IRelacionProductoRecursoRepository } from '../INTERFACES/IRelacionProductoRecursoRepository';

/**
 * Implementación concreta del repositorio de RelacionProductoRecurso sobre TypeORM.
 */
@Injectable()
export class RelacionProductoRecursoRepository implements IRelacionProductoRecursoRepository {
  constructor(
    @InjectRepository(RelacionProductoRecurso)
    private readonly repository: Repository<RelacionProductoRecurso>,
  ) {}

  buscarPorProductoConRecurso(productoId: string): Promise<RelacionProductoRecurso[]> {
    return this.repository.find({
      where: { productoId },
      relations: ['recurso'],
    });
  }
}
