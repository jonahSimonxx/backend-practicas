import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './DataBase/basedato';
import { AuditoriaModule } from './Auditoria/Auditoria.module';
import { AlmacenModule } from './Almacen/Almacen_module';
import { CalculoEstrategiaModule } from './CalculoEstrategia/CalculoEstrategia.module';
import { DemandaModule } from './Demanda/Demanda.module';
import { DetalleCalculoRecursoModule } from './DetalleCalculoRecurso/DetalleCalculoRecurso.module';
import { EstrategiasModule } from './Estrategia/Estrategia_module';
import { InventarioModule } from './Inventario/Inventario.module';
import { ProductoModule } from './Producto/Producto.module';
import { RecursoModule } from './Recurso/Recurso.module';
import { RelacionProductoRecursoModule } from './RelacionProductoRecurso/RelacionProductoRecurso.module';
import { AuthModule } from './Auth/Auth.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    DatabaseModule,
    AuditoriaModule,
    AuthModule,
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
