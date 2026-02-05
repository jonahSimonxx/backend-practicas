import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RelacionProductoRecursoService } from './RelacionProductoRecurso.service';
import { RelacionProductoRecursoController } from './RelacionProductoRecurso.controller';
import { RelacionProductoRecurso } from './ENTITY/RelacionProductoRecurso.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([RelacionProductoRecurso]),
  ],
  controllers: [RelacionProductoRecursoController],
  providers: [RelacionProductoRecursoService],
  exports: [RelacionProductoRecursoService, TypeOrmModule],
})
export class RelacionProductoRecursoModule {}