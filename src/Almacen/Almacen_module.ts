import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlmacenService } from './Almacen_service';
import { AlmacenController } from './Almacen_controller';
import { Almacen } from './ENTITY/Almacen.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Almacen]),
  ],
  controllers: [AlmacenController],
  providers: [AlmacenService],
  exports: [AlmacenService, TypeOrmModule], 
})
export class AlmacenModule {}