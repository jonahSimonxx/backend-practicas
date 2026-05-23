import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RelacionProductoRecursoService } from './RelacionProductoRecurso.service';
import { RelacionProductoRecursoController } from './RelacionProductoRecurso.controller';
import { RelacionProductoRecurso } from './ENTITY/RelacionProductoRecurso.entity';
import { Producto } from '../Producto/ENTITY/Producto.entity';
import { Recurso } from '../Recurso/ENTITY/Recurso.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([RelacionProductoRecurso, Producto, Recurso]),
  ],
  controllers: [RelacionProductoRecursoController],
  providers: [RelacionProductoRecursoService],
  exports: [RelacionProductoRecursoService, TypeOrmModule],
})
export class RelacionProductoRecursoModule {}
