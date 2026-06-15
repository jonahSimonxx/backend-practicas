import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalculoEstrategiaService } from './CalculoEstrategia.service';
import { CalculoEstrategiaController } from './CalculoEstrategia.controller';
import { CalculoEstrategia } from './ENTITY/CalculoEstrategia.entity';
import { EstrategiasModule } from '../Estrategia/Estrategia_module';
import { CALCULO_ESTRATEGIA_REPOSITORY } from '../DataBase/INTERFACES/ICalculoEstrategiaRepository';
import { CalculoEstrategiaRepository } from '../DataBase/REPOSITORIES/CalculoEstrategiaRepository';

@Module({
  imports: [
    TypeOrmModule.forFeature([CalculoEstrategia]),
    EstrategiasModule,
  ],
  controllers: [CalculoEstrategiaController],
  providers: [
    CalculoEstrategiaService,
    // Patrón Repositorio
    { provide: CALCULO_ESTRATEGIA_REPOSITORY, useClass: CalculoEstrategiaRepository },
  ],
  exports: [CalculoEstrategiaService, TypeOrmModule],
})
export class CalculoEstrategiaModule {}
