import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DemandaService } from './Demanda.service';
import { DemandaController } from './Demanda.controller';
import { Demanda } from './ENTITY/Demanda.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Demanda]),
  ],
  controllers: [DemandaController],
  providers: [DemandaService],
  exports: [DemandaService, TypeOrmModule],
})
export class DemandaModule {}