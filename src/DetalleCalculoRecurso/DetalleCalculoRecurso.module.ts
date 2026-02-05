import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetalleCalculoRecursoService } from './DetalleCalculoRecurso.service';
import { DetalleCalculoRecursoController } from './DetalleCalculoRecurso.controller';
import { DetalleCalculoRecurso } from './ENTITY/DetalleCalculoRecurso.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DetalleCalculoRecurso]),
  ],
  controllers: [DetalleCalculoRecursoController],
  providers: [DetalleCalculoRecursoService],
  exports: [DetalleCalculoRecursoService, TypeOrmModule],
})
export class DetalleCalculoRecursoModule {}