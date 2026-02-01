import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstrategiasService } from './Estrategia_service';
import { EstrategiasController } from './Estrategia_controller';
import { Estrategia } from './ENTITY/Estrategia.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Estrategia]),
  ],
  controllers: [EstrategiasController],
  providers: [EstrategiasService],
  exports: [EstrategiasService, TypeOrmModule],
})
export class EstrategiasModule {}