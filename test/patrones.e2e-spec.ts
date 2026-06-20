import { Module, INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { DataType, newDb } from 'pg-mem';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';
import request from 'supertest';
import { DataSource, Repository } from 'typeorm';

import { AppModule } from '../src/app.module';
import { DatabaseModule } from '../src/DataBase/basedato';

import { Estrategia } from '../src/Estrategia/ENTITY/Estrategia.entity';
import { Producto } from '../src/Producto/ENTITY/Producto.entity';
import { Demanda } from '../src/Demanda/ENTITY/Demanda.entity';
import { Recurso } from '../src/Recurso/ENTITY/Recurso.entity';
import { RelacionProductoRecurso } from '../src/RelacionProductoRecurso/ENTITY/RelacionProductoRecurso.entity';
import { Almacen } from '../src/Almacen/ENTITY/Almacen.entity';
import { Inventario } from '../src/Inventario/ENTITY/Inventario.entity';
import { CalculoEstrategia } from '../src/CalculoEstrategia/ENTITY/CalculoEstrategia.entity';
import { DetalleCalculoRecurso } from '../src/DetalleCalculoRecurso/ENTITY/DetalleCalculoRecurso.entity';
import { User } from '../src/Auth/ENTITY/User.entity';
import { Auditoria } from '../src/Auditoria/ENTITY/Auditoria.entity';

const ENTIDADES = [
  Estrategia,
  Producto,
  Demanda,
  Recurso,
  RelacionProductoRecurso,
  Almacen,
  Inventario,
  CalculoEstrategia,
  DetalleCalculoRecurso,
  User,
  Auditoria,
];

/**
 * Módulo de base de datos de prueba: reemplaza Postgres real por un Postgres
 * en memoria (pg-mem), arrancando la MISMA configuración de entidades de la app.
 * Así se ejercita el grafo de inyección completo (TypeORM, repositorios, etc.).
 */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({ type: 'postgres', entities: ENTIDADES, synchronize: true }),
      dataSourceFactory: async () => {
        const db = newDb();
        // TypeORM PostgresDriver consulta version() al conectar
        db.public.registerFunction({
          name: 'version',
          returns: DataType.text,
          implementation: () => 'PostgreSQL 14.5 (pg-mem)',
          impure: true,
        });
        db.public.registerFunction({
          name: 'current_database',
          returns: DataType.text,
          implementation: () => 'test',
          impure: true,
        });
        // uuid_generate_v4 / gen_random_uuid usados por PrimaryGeneratedColumn('uuid')
        db.registerExtension('uuid-ossp', (schema) => {
          schema.registerFunction({
            name: 'uuid_generate_v4',
            returns: DataType.uuid,
            implementation: () => randomUUID(),
            impure: true,
          });
        });
        db.public.registerFunction({
          name: 'gen_random_uuid',
          returns: DataType.uuid,
          implementation: () => randomUUID(),
          impure: true,
        });
        const ds: DataSource = db.adapters.createTypeormDataSource({
          type: 'postgres',
          entities: ENTIDADES,
          synchronize: true,
        });
        await ds.initialize(); // ya inicializado => Nest no vuelve a inicializar
        return ds;
      },
    }),
  ],
  exports: [TypeOrmModule],
})
class TestDatabaseModule {}

describe('Patrones Strategy / Observer / Repositorio (E2E real con pg-mem)', () => {
  jest.setTimeout(60000);

  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideModule(DatabaseModule)
      .useModule(TestDatabaseModule)
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();

    // --- Sembrar usuario admin y datos de dominio de soporte ---
    const userRepo: Repository<User> = app.get(getRepositoryToken(User));
    const passwordHash = await bcrypt.hash('password123', 10);
    await userRepo.save(
      userRepo.create({ email: 'admin@example.com', passwordHash, role: 'admin', isActive: true }),
    );

    const productoRepo: Repository<Producto> = app.get(getRepositoryToken(Producto));
    await productoRepo.save(
      productoRepo.create({
        id: 'PROD-1',
        nombre: 'Producto 1',
        descripcion: 'Demo',
        tipoEnvase: 'caja',
        tipoProducto: 'farmaceutico',
        unidadMedida: 'unidad',
      }),
    );

    const recursoRepo: Repository<Recurso> = app.get(getRepositoryToken(Recurso));
    await recursoRepo.save(
      recursoRepo.create({
        id: 'REC-1',
        nombre: 'Recurso 1',
        tipoRecurso: 'materia',
        unidadMedida: 'kg',
        descripcion: 'Demo',
      }),
    );

    const almacenRepo: Repository<Almacen> = app.get(getRepositoryToken(Almacen));
    await almacenRepo.save(
      almacenRepo.create({
        id: 'ALM-1',
        nombre: 'Almacen 1',
        ubicacion: 'Lima',
        tipoAlmacen: 'central',
        estado: 'activo',
      }),
    );

    const relacionRepo: Repository<RelacionProductoRecurso> = app.get(
      getRepositoryToken(RelacionProductoRecurso),
    );
    await relacionRepo.save(
      relacionRepo.create({
        id: 'RPR-1',
        productoId: 'PROD-1',
        recursoId: 'REC-1',
        cantidadRequerida: 10,
        tipoRelacion: 'consumo',
      }),
    );

    // --- Login para obtener JWT ---
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@example.com', password: 'password123' })
      .expect(200);
    token = res.body.access_token;
    expect(token).toBeDefined();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('Repositorio + Observer: crea estrategia vía API y audita CREAR_ESTRATEGIA con usuario', async () => {
    await request(app.getHttpServer())
      .post('/estrategias')
      .set('Authorization', `Bearer ${token}`)
      .send({
        id: 'EST-1',
        nombre: 'Estrategia 1',
        descripcion: 'Demo',
        presupuestoMaximo: 1000,
        estado: 'activa',
      })
      .expect(201);

    // Demanda: 10 * cantidadRequerida(10) = 100 requerido de REC-1
    const demandaRepo: Repository<Demanda> = app.get(getRepositoryToken(Demanda));
    await demandaRepo.save(
      demandaRepo.create({
        id: 'DEM-1',
        productoId: 'PROD-1',
        estrategiaId: 'EST-1',
        tipoDemanda: 'mensual',
        cantidadRequerida: 10,
        periodo: 'mensual',
      }),
    );

    const auditoria = await request(app.getHttpServer())
      .get('/auditoria?entidad=Estrategia&entidadId=EST-1')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const crear = auditoria.body.find((a: any) => a.accion === 'CREAR_ESTRATEGIA');
    expect(crear).toBeDefined();
    expect(crear.usuarioId).toBeTruthy(); // usuario del JWT capturado
  });

  it('Repositorio + Observer: crea inventario vía API y audita CREAR_INVENTARIO', async () => {
    await request(app.getHttpServer())
      .post('/inventarios')
      .set('Authorization', `Bearer ${token}`)
      .send({
        id: 'INV-1',
        recursoId: 'REC-1',
        almacenId: 'ALM-1',
        lote: 1001,
        fabricante: 'Fab',
        fechaFabricacion: '2024-01-15',
        fechaCaducidad: '2027-01-15',
        cantidadDisponible: 100,
        estado: 'disponible',
        numeroMuestreo: 1,
        unidadMedida: 'kg',
        areaAlmacenamiento: 'Zona A',
      })
      .expect(201);

    const auditoria = await request(app.getHttpServer())
      .get('/auditoria?entidad=Inventario')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(auditoria.body.some((a: any) => a.accion === 'CREAR_INVENTARIO')).toBe(true);
  });

  it('Strategy: calcularEstrategiaDetallada delega en la estrategia => POSIBLE (100 >= 100)', async () => {
    const res = await request(app.getHttpServer())
      .post('/calculo-estrategias/calcular-detallado/EST-1')
      .send({})
      .expect(201);

    expect(res.body.resultadoGeneral).toBe('posible');
    expect(res.body.productos[0].recursos[0].existenciaInventario).toBe(100);
  });

  it('Observer: tras calcular, queda traza CALCULAR_VIABILIDAD en auditoría', async () => {
    const auditoria = await request(app.getHttpServer())
      .get('/auditoria?entidad=Estrategia&entidadId=EST-1')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    const calc = auditoria.body.filter((a: any) => a.accion === 'CALCULAR_VIABILIDAD');
    expect(calc.length).toBeGreaterThanOrEqual(1);
    expect(calc[0].detalles.resultadoGeneral).toBe('posible');
  });

  it('Almacenes inactivos NO se consideran en el cálculo (regla implícita)', async () => {
    // Almacén inactivo con MUCHO inventario del recurso REC-1.
    const almacenRepo: Repository<Almacen> = app.get(getRepositoryToken(Almacen));
    await almacenRepo.save(
      almacenRepo.create({
        id: 'ALM-INACTIVO',
        nombre: 'Almacen inactivo',
        ubicacion: 'Cusco',
        tipoAlmacen: 'secundario',
        estado: 'inactivo',
      }),
    );
    const inventarioRepo: Repository<Inventario> = app.get(getRepositoryToken(Inventario));
    await inventarioRepo.save(
      inventarioRepo.create({
        id: 'INV-INACT',
        recursoId: 'REC-1',
        almacenId: 'ALM-INACTIVO',
        lote: 2002,
        fabricante: 'Fab',
        fechaFabricacion: new Date('2024-01-15'),
        fechaCaducidad: new Date('2027-01-15'),
        cantidadDisponible: 500,
        estado: 'disponible',
        numeroMuestreo: 1,
        unidadMedida: 'kg',
        areaAlmacenamiento: 'Zona B',
      }),
    );

    // A pesar de las 500 unidades del almacén inactivo, la existencia sigue
    // siendo 100 (solo cuenta el almacén activo ALM-1).
    const res = await request(app.getHttpServer())
      .post('/calculo-estrategias/calcular-detallado/EST-1')
      .send({})
      .expect(201);

    expect(res.body.productos[0].recursos[0].existenciaInventario).toBe(100);
    expect(res.body.resultadoGeneral).toBe('posible');
  });

  it('priorizarAlmacenes restringe el cálculo a los almacenes indicados (y activos)', async () => {
    // Priorizar el almacén activo ALM-1 => sigue siendo posible (100 >= 100).
    const conActivo = await request(app.getHttpServer())
      .post('/calculo-estrategias/calcular-detallado/EST-1')
      .send({ priorizarAlmacenes: ['ALM-1'] })
      .expect(201);
    expect(conActivo.body.productos[0].recursos[0].existenciaInventario).toBe(100);
    expect(conActivo.body.resultadoGeneral).toBe('posible');

    // Priorizar solo el almacén inactivo => se ignora, existencia 0 => imposible.
    const conInactivo = await request(app.getHttpServer())
      .post('/calculo-estrategias/calcular-detallado/EST-1')
      .send({ priorizarAlmacenes: ['ALM-INACTIVO'] })
      .expect(201);
    expect(conInactivo.body.productos[0].recursos[0].existenciaInventario).toBe(0);
    expect(conInactivo.body.resultadoGeneral).toBe('imposible');
  });

  it('Compatibilidad: el endpoint protegido sigue exigiendo JWT (401 sin token)', async () => {
    await request(app.getHttpServer()).get('/estrategias').expect(401);
  });
});
