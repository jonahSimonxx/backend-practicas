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

  it('Strategy: el algoritmo BÁSICO considera la estrategia POSIBLE (100 >= 100)', async () => {
    const res = await request(app.getHttpServer())
      .post('/calculo-estrategias/calcular-detallado/EST-1')
      .send({ algoritmo: 'basico' })
      .expect(201);

    expect(res.body.resultadoGeneral).toBe('posible');
    expect(res.body.productos[0].recursos[0].existenciaInventario).toBe(100);
  });

  it('Strategy: el algoritmo AVANZADO considera la estrategia IMPOSIBLE (margen 10% => requiere 110)', async () => {
    const res = await request(app.getHttpServer())
      .post('/calculo-estrategias/calcular-detallado/EST-1')
      .send({ algoritmo: 'avanzado' })
      .expect(201);

    expect(res.body.resultadoGeneral).toBe('imposible');
    expect(res.body.productos[0].recursos[0].deficit).toBeCloseTo(10);
  });

  it('Observer: tras calcular, queda traza CALCULAR_VIABILIDAD en auditoría', async () => {
    const auditoria = await request(app.getHttpServer())
      .get('/auditoria?entidad=Estrategia&entidadId=EST-1')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    const calc = auditoria.body.filter((a: any) => a.accion === 'CALCULAR_VIABILIDAD');
    expect(calc.length).toBeGreaterThanOrEqual(2); // basico + avanzado
    expect(['basico', 'avanzado']).toContain(calc[0].detalles.algoritmo);
  });

  it('Compatibilidad: el endpoint protegido sigue exigiendo JWT (401 sin token)', async () => {
    await request(app.getHttpServer()).get('/estrategias').expect(401);
  });
});
