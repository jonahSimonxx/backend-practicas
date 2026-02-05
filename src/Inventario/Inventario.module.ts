import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventarioService } from './Inventario.service';
import { InventarioController } from './Inventario.controller';
import { Inventario } from './ENTITY/Inventario.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Inventario]),
  ],
  controllers: [InventarioController],
  providers: [InventarioService],
  exports: [InventarioService, TypeOrmModule],
})
export class InventarioModule {}