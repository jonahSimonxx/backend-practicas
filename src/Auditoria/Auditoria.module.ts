import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auditoria } from './ENTITY/Auditoria.entity';
import { AuditoriaService } from './Auditoria.service';
import { AuditoriaController } from './Auditoria.controller';
import { AuditoriaPublisher } from './Auditoria.publisher';

/**
 * Módulo de auditoría (patrón Observer, RF-016).
 *
 * Se declara `@Global` para que cualquier servicio del sistema pueda inyectar
 * el {@link AuditoriaPublisher} y emitir eventos sin importar el módulo en cada
 * feature.
 */
@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Auditoria])],
  controllers: [AuditoriaController],
  providers: [AuditoriaService, AuditoriaPublisher],
  exports: [AuditoriaPublisher],
})
export class AuditoriaModule {}
