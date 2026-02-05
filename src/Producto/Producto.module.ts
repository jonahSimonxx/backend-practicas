import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductoService } from './Producto.service';
import { ProductoController } from './Producto.controller';
import { Producto } from './ENTITY/Producto.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Producto]),
  ],
  controllers: [ProductoController],
  providers: [ProductoService],
  exports: [ProductoService, TypeOrmModule],
})
export class ProductoModule {}