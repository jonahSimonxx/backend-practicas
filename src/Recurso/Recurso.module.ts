import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecursoService } from './Recurso.service';
import { RecursoController } from './Recurso.controller';
import { Recurso } from './ENTITY/Recurso.entity';
import { Inventario } from '../Inventario/ENTITY/Inventario.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Recurso, Inventario]),
  ],
  controllers: [RecursoController],
  providers: [RecursoService],
  exports: [RecursoService, TypeOrmModule],
})
export class RecursoModule {}