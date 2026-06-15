import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstrategiaService } from './Estrategia_service';
import { EstrategiaController } from './Estrategia_controller';
import { Estrategia } from './ENTITY/Estrategia.entity';
import { RelacionProductoRecurso } from '../RelacionProductoRecurso/ENTITY/RelacionProductoRecurso.entity';
import { Inventario } from '../Inventario/ENTITY/Inventario.entity';
import { CalculoEstrategia } from '../CalculoEstrategia/ENTITY/CalculoEstrategia.entity';
import { ESTRATEGIA_REPOSITORY } from '../DataBase/INTERFACES/IEstrategiaRepository';
import { INVENTARIO_REPOSITORY } from '../DataBase/INTERFACES/IInventarioRepository';
import { RELACION_PRODUCTO_RECURSO_REPOSITORY } from '../DataBase/INTERFACES/IRelacionProductoRecursoRepository';
import { CALCULO_ESTRATEGIA_REPOSITORY } from '../DataBase/INTERFACES/ICalculoEstrategiaRepository';
import { EstrategiaRepository } from '../DataBase/REPOSITORIES/EstrategiaRepository';
import { InventarioRepository } from '../DataBase/REPOSITORIES/InventarioRepository';
import { RelacionProductoRecursoRepository } from '../DataBase/REPOSITORIES/RelacionProductoRecursoRepository';
import { CalculoEstrategiaRepository } from '../DataBase/REPOSITORIES/CalculoEstrategiaRepository';
import { CalculoViabilidadBasico } from '../CalculoEstrategia/STRATEGIES/CalculoViabilidadBasico';
import { CalculoViabilidadAvanzado } from '../CalculoEstrategia/STRATEGIES/CalculoViabilidadAvanzado';
import { EstrategiaCalculoFactory } from '../CalculoEstrategia/STRATEGIES/EstrategiaCalculoFactory';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Estrategia,
      RelacionProductoRecurso,
      Inventario,
      CalculoEstrategia,
    ]),
  ],
  controllers: [EstrategiaController],
  providers: [
    EstrategiaService,
    // Patrón Repositorio: la abstracción (token) se enlaza a la implementación concreta
    { provide: ESTRATEGIA_REPOSITORY, useClass: EstrategiaRepository },
    { provide: INVENTARIO_REPOSITORY, useClass: InventarioRepository },
    { provide: RELACION_PRODUCTO_RECURSO_REPOSITORY, useClass: RelacionProductoRecursoRepository },
    { provide: CALCULO_ESTRATEGIA_REPOSITORY, useClass: CalculoEstrategiaRepository },
    // Patrón Strategy: algoritmos de cálculo + selector
    CalculoViabilidadBasico,
    CalculoViabilidadAvanzado,
    EstrategiaCalculoFactory,
  ],
  exports: [EstrategiaService],
})
export class EstrategiasModule {}
