import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './DataBase/basedato';
import { AlmacenModule } from './Almacen/Almacen_module';
import { CalculoEstrategiaModule } from './CalculoEstrategia/CalculoEstrategia.module';
import { DemandaModule } from './Demanda/Demanda.module';
import { DetalleCalculoRecursoModule } from './DetalleCalculoRecurso/DetalleCalculoRecurso.module';
import { EstrategiasModule } from './Estrategia/Estrategia_module';
import { InventarioModule } from './Inventario/Inventario.module';
import { ProductoModule } from './Producto/Producto.module';
import { RecursoModule } from './Recurso/Recurso.module';
import { RelacionProductoRecursoModule } from './RelacionProductoRecurso/RelacionProductoRecurso.module';

@Module({
  imports: [
    DatabaseModule,
    AlmacenModule,
    CalculoEstrategiaModule,
    DemandaModule,
    DetalleCalculoRecursoModule,
    EstrategiasModule,
    InventarioModule,
    ProductoModule,
    RecursoModule,
    RelacionProductoRecursoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
