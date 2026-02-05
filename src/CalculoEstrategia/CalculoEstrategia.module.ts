import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalculoEstrategiaService } from './CalculoEstrategia.service';
import { CalculoEstrategiaController } from './CalculoEstrategia.controller';
import { CalculoEstrategia } from './ENTITY/CalculoEstrategia.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CalculoEstrategia]),
  ],
  controllers: [CalculoEstrategiaController],
  providers: [CalculoEstrategiaService],
  exports: [CalculoEstrategiaService, TypeOrmModule],
})
export class CalculoEstrategiaModule {}