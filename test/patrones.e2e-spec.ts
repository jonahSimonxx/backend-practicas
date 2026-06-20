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
    await almacenRepo.save([
      almacenRepo.create({ id: 'ALM-1', nombre: 'Almacen 1', ubicacion: 'Lima', tipoAlmacen: 'central', estado: 'activo' }),
      almacenRepo.create({ id: 'ALM-2', nombre: 'Almacen 2', ubicacion: 'Lima', tipoAlmacen: 'central', estado: 'activo' }),
      almacenRepo.create({ id: 'ALM-3', nombre: 'Almacen 3', ubicacion: 'Lima', tipoAlmacen: 'central', estado: 'inactivo' }),
    ]);

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

    // Inventario de REC-1 repartido en almacenes (requerido total = 10 * 10 = 100):
    //   ALM-1 (activo):    60   -> se crea vía API en un test (audita CREAR_INVENTARIO)
    //   ALM-2 (activo):    50
    //   ALM-3 (inactivo): 1000  -> debe quedar EXCLUIDO siempre
    const inventarioRepo: Repository<Inventario> = app.get(getRepositoryToken(Inventario));
    await inventarioRepo.save([
      inventarioRepo.create({
        id: 'INV-2', recursoId: 'REC-1', almacenId: 'ALM-2', lote: 2002, fabricante: 'Fab',
        fechaFabricacion: new Date('2024-01-15'), fechaCaducidad: new Date('2027-01-15'),
        cantidadDisponible: 50, estado: 'disponible', numeroMuestreo: 1,
        fechaVigencia: null, unidadMedida: 'kg', areaAlmacenamiento: 'Zona A',
      }),
      inventarioRepo.create({
        id: 'INV-3', recursoId: 'REC-1', almacenId: 'ALM-3', lote: 3003, fabricante: 'Fab',
        fechaFabricacion: new Date('2024-01-15'), fechaCaducidad: new Date('2027-01-15'),
        cantidadDisponible: 1000, estado: 'disponible', numeroMuestreo: 1,
        fechaVigencia: null, unidadMedida: 'kg', areaAlmacenamiento: 'Zona A',
      }),
    ]);

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
        cantidadDisponible: 60,
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

  it('Strategy: sin filtro suma solo almacenes ACTIVOS (60+50=110) y excluye el inactivo (1000) => POSIBLE', async () => {
    const res = await request(app.getHttpServer())
      .post('/calculo-estrategias/calcular-detallado/EST-1')
      .send({})
      .expect(201);

    // Si el inventario del almacén inactivo (1000) se contara, existencia sería 1110.
    expect(res.body.productos[0].recursos[0].existenciaInventario).toBe(110);
    expect(res.body.resultadoGeneral).toBe('posible');
  });

  it('priorizarAlmacenes: restringe a ALM-1 (60 < 100) => IMPOSIBLE con déficit 40', async () => {
    const res = await request(app.getHttpServer())
      .post('/calculo-estrategias/calcular-detallado/EST-1')
      .send({ priorizarAlmacenes: ['ALM-1'] })
      .expect(201);

    expect(res.body.productos[0].recursos[0].existenciaInventario).toBe(60);
    expect(res.body.productos[0].recursos[0].deficit).toBe(40);
    expect(res.body.resultadoGeneral).toBe('imposible');
  });

  it('Exclusión implícita: aunque se priorice el almacén inactivo (ALM-3), queda excluido => solo ALM-1 (60) => IMPOSIBLE', async () => {
    const res = await request(app.getHttpServer())
      .post('/calculo-estrategias/calcular-detallado/EST-1')
      .send({ priorizarAlmacenes: ['ALM-1', 'ALM-3'] })
      .expect(201);

    // ALM-3 está inactivo: sus 1000 unidades NO se cuentan aunque se pidan explícitamente.
    expect(res.body.productos[0].recursos[0].existenciaInventario).toBe(60);
    expect(res.body.resultadoGeneral).toBe('imposible');
  });

  it('Observer: tras calcular, queda traza CALCULAR_VIABILIDAD en auditoría', async () => {
    const auditoria = await request(app.getHttpServer())
      .get('/auditoria?entidad=Estrategia&entidadId=EST-1')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    const calc = auditoria.body.filter((a: any) => a.accion === 'CALCULAR_VIABILIDAD');
    // Se hicieron 3 cálculos (sin filtro + dos con priorizarAlmacenes)
    expect(calc.length).toBeGreaterThanOrEqual(3);
    // El más reciente registra el filtro de almacenes usado
    expect(calc[0].detalles).toHaveProperty('resultadoGeneral');
    expect(calc[0].detalles).toHaveProperty('almacenesPriorizados');
  });

  it('Compatibilidad: el endpoint protegido sigue exigiendo JWT (401 sin token)', async () => {
    await request(app.getHttpServer()).get('/estrategias').expect(401);
  });
});
