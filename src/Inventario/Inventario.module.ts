import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventarioService } from './Inventario.service';
import { InventarioController } from './Inventario.controller';
import { Inventario } from './ENTITY/Inventario.entity';
import { INVENTARIO_REPOSITORY } from '../DataBase/INTERFACES/IInventarioRepository';
import { InventarioRepository } from '../DataBase/REPOSITORIES/InventarioRepository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Inventario]),
  ],
  controllers: [InventarioController],
  providers: [
    InventarioService,
    // Patrón Repositorio
    { provide: INVENTARIO_REPOSITORY, useClass: InventarioRepository },
  ],
  exports: [InventarioService, TypeOrmModule],
})
export class InventarioModule {}
