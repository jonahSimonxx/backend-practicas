import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstrategiaService } from './Estrategia_service';
import { EstrategiaController } from './Estrategia_controller';
import { Estrategia } from './ENTITY/Estrategia.entity';
import { RelacionProductoRecurso } from '../RelacionProductoRecurso/ENTITY/RelacionProductoRecurso.entity';
import { Inventario } from '../Inventario/ENTITY/Inventario.entity';
import { CalculoEstrategia } from '../CalculoEstrategia/ENTITY/CalculoEstrategia.entity';
import { DetalleCalculoRecurso } from '../DetalleCalculoRecurso/ENTITY/DetalleCalculoRecurso.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Estrategia,
      RelacionProductoRecurso,
      Inventario,
      CalculoEstrategia,
      DetalleCalculoRecurso,
    ]),
  ],
  controllers: [EstrategiaController],
  providers: [EstrategiaService],
  exports: [EstrategiaService, TypeOrmModule],
})
export class EstrategiasModule {}