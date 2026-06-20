import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Inventario } from '../../Inventario/ENTITY/Inventario.entity';
import { IInventarioRepository } from '../INTERFACES/IInventarioRepository';

/**
 * Implementación concreta del repositorio de Inventario sobre TypeORM.
 *
 * Centraliza las consultas con QueryBuilder (Tarea 3) en la capa de
 * repositorio, manteniendo el servicio libre de detalles de acceso a datos.
 */
@Injectable()
export class InventarioRepository implements IInventarioRepository {
  constructor(
    @InjectRepository(Inventario)
    private readonly repository: Repository<Inventario>,
  ) {}

  crear(data: Partial<Inventario>): Inventario {
    return this.repository.create(data);
  }

  guardar(inventario: Inventario): Promise<Inventario> {
    return this.repository.save(inventario);
  }

  buscarTodos(): Promise<Inventario[]> {
    return this.repository.find({ order: { fechaFabricacion: 'DESC' } });
  }

  buscarPorId(id: string): Promise<Inventario | null> {
    return this.repository.findOne({ where: { id } });
  }

  buscarUno(criterios: Partial<Inventario>): Promise<Inventario | null> {
    return this.repository.findOne({ where: criterios as FindOptionsWhere<Inventario> });
  }

  buscarPorRecurso(recursoId: string): Promise<Inventario[]> {
    return this.repository.find({
      where: { recursoId },
      order: { fechaFabricacion: 'DESC' },
    });
  }

  buscarPorAlmacen(almacenId: string): Promise<Inventario[]> {
    return this.repository.find({
      where: { almacenId },
      order: { fechaFabricacion: 'DESC' },
    });
  }

  buscarPorEstado(estado: string): Promise<Inventario[]> {
    return this.repository.find({
      where: { estado },
      order: { fechaFabricacion: 'DESC' },
    });
  }

  buscarDisponiblesPorRecurso(recursoId: string): Promise<Inventario[]> {
    return this.repository.find({
      where: { recursoId, estado: 'disponible' },
    });
  }

  buscarDisponiblesEnAlmacenesActivos(
    recursoId: string,
    almacenesPermitidos?: string[],
  ): Promise<Inventario[]> {
    const qb = this.repository
      .createQueryBuilder('inventario')
      .innerJoin('inventario.almacen', 'almacen')
      .where('inventario.recursoId = :recursoId', { recursoId })
      .andWhere('inventario.estado = :estadoInv', { estadoInv: 'disponible' })
      // Exclusión implícita de almacenes inactivos (antes era el flag usarAlmacenesNoTocar)
      .andWhere('almacen.estado = :estadoAlm', { estadoAlm: 'activo' });

    // Filtro opcional: restringir a almacenes específicos (priorizarAlmacenes)
    if (almacenesPermitidos && almacenesPermitidos.length > 0) {
      qb.andWhere('inventario.almacenId IN (:...almacenes)', {
        almacenes: almacenesPermitidos,
      });
    }

    return qb.getMany();
  }

  async actualizar(id: string, cambios: Partial<Inventario>): Promise<void> {
    await this.repository.update(id, cambios);
  }

  async eliminar(id: string): Promise<number> {
    const result = await this.repository.delete(id);
    return result.affected ?? 0;
  }

  // ===== Consultas con QueryBuilder (Tarea 3) =====

  buscarPorFabricante(fabricante: string): Promise<Inventario[]> {
    return this.repository
      .createQueryBuilder('inventario')
      .where('LOWER(inventario.fabricante) LIKE LOWER(:fabricante)', {
        fabricante: `%${fabricante}%`,
      })
      .getMany();
  }

  buscarCaducados(referencia: Date): Promise<Inventario[]> {
    return this.repository
      .createQueryBuilder('inventario')
      .where('inventario.fechaCaducidad < :referencia', { referencia })
      .getMany();
  }

  buscarPorCaducar(desde: Date, hasta: Date): Promise<Inventario[]> {
    return this.repository
      .createQueryBuilder('inventario')
      .where('inventario.fechaCaducidad BETWEEN :desde AND :hasta', { desde, hasta })
      .getMany();
  }
}
