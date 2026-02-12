import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Estrategia } from '../Estrategia/ENTITY/Estrategia.entity';
import { Producto } from '../Producto/ENTITY/Producto.entity';
import { Demanda } from '../Demanda/ENTITY/Demanda.entity';
import { Recurso } from '../Recurso/ENTITY/Recurso.entity';
import { RelacionProductoRecurso } from '../RelacionProductoRecurso/ENTITY/RelacionProductoRecurso.entity';
import { Almacen } from '../Almacen/ENTITY/Almacen.entity';
import { Inventario } from '../Inventario/ENTITY/Inventario.entity';
import { CalculoEstrategia } from '../CalculoEstrategia/ENTITY/CalculoEstrategia.entity';
import { DetalleCalculoRecurso } from '../DetalleCalculoRecurso/ENTITY/DetalleCalculoRecurso.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5434),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', '1234'),
        database: configService.get('DB_DATABASE', 'ahora si'), 
        entities: [
          Estrategia,
          Producto,
          Demanda,
          Recurso,
          RelacionProductoRecurso,
          Almacen,
          Inventario,
          CalculoEstrategia,
          DetalleCalculoRecurso,
        ],
        synchronize: configService.get('NODE_ENV') === 'development',
        logging: configService.get('NODE_ENV') === 'development',
        extra: {
          charset: 'utf8mb4_unicode_ci',
        },
        ssl: configService.get('DB_SSL') === 'true' ? {
          rejectUnauthorized: false,
        } : false,
        poolSize: 10,
        connectTimeoutMS: 2000,
      }),
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}