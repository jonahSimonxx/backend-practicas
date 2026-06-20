import { Test, TestingModule } from '@nestjs/testing';
import { EstrategiaService } from './Estrategia_service';
import { ESTRATEGIA_REPOSITORY } from '../DataBase/INTERFACES/IEstrategiaRepository';
import { INVENTARIO_REPOSITORY } from '../DataBase/INTERFACES/IInventarioRepository';
import { RELACION_PRODUCTO_RECURSO_REPOSITORY } from '../DataBase/INTERFACES/IRelacionProductoRecursoRepository';
import { CALCULO_ESTRATEGIA_REPOSITORY } from '../DataBase/INTERFACES/ICalculoEstrategiaRepository';
import { ESTRATEGIA_CALCULO } from '../CalculoEstrategia/STRATEGIES/IEstrategiaCalculo';
import { CalculoViabilidadBasico } from '../CalculoEstrategia/STRATEGIES/CalculoViabilidadBasico';
import { AuditoriaPublisher } from '../Auditoria/Auditoria.publisher';
import { AccionAuditoria } from '../Auditoria/EVENTS/auditoria.event';

describe('EstrategiaService (integración de patrones)', () => {
  let service: EstrategiaService;
  let estrategiaRepo: any;
  let auditoria: { emitir: jest.Mock };

  const estrategia = {
    id: 'EST-1',
    nombre: 'Estrategia 1',
    presupuestoMaximo: 1000,
    demandas: [
      {
        cantidadRequerida: 10,
        producto: { id: 'PROD-1', nombre: 'Producto 1' },
      },
    ],
  };

  // Inventario disponible del recurso REC-1; parametrizable por test.
  let cantidadDisponible: number;

  beforeEach(async () => {
    cantidadDisponible = 100;
    estrategiaRepo = {
      buscarPorIdConRelaciones: jest.fn().mockResolvedValue(estrategia),
      actualizar: jest.fn().mockResolvedValue(undefined),
    };
    const relacionRepo = {
      buscarPorProductoConRecurso: jest.fn().mockResolvedValue([
        {
          cantidadRequerida: 10, // 10 * demanda(10) = 100 requerido
          tipoRelacion: 'consumo',
          recurso: {
            id: 'REC-1',
            nombre: 'Recurso 1',
            tipoRecurso: 'materia-prima',
            unidadMedida: 'kg',
          },
        },
      ]),
    };
    const inventarioRepo = {
      buscarDisponiblesEnAlmacenesActivos: jest.fn().mockImplementation(() =>
        Promise.resolve([
          {
            almacenId: 'ALM-1',
            lote: 1,
            fabricante: 'F',
            fechaFabricacion: new Date(),
            fechaCaducidad: new Date(),
            cantidadDisponible,
            unidadMedida: 'kg',
          },
        ]),
      ),
    };
    const calculoRepo = {
      buscarUltimoPorEstrategia: jest.fn().mockResolvedValue(null),
    };
    auditoria = { emitir: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EstrategiaService,
        // Patrón Strategy: la abstracción se enlaza a la lógica de viabilidad real
        { provide: ESTRATEGIA_CALCULO, useClass: CalculoViabilidadBasico },
        { provide: ESTRATEGIA_REPOSITORY, useValue: estrategiaRepo },
        { provide: RELACION_PRODUCTO_RECURSO_REPOSITORY, useValue: relacionRepo },
        { provide: INVENTARIO_REPOSITORY, useValue: inventarioRepo },
        { provide: CALCULO_ESTRATEGIA_REPOSITORY, useValue: calculoRepo },
        { provide: AuditoriaPublisher, useValue: auditoria },
      ],
    }).compile();

    service = module.get<EstrategiaService>(EstrategiaService);
  });

  it('calcularEstrategiaDetallada delega en la estrategia: existencia=100 cubre requerido=100 => posible', async () => {
    const resultado = await service.calcularEstrategiaDetallada('EST-1');

    expect(resultado.resultadoGeneral).toBe('posible');
    expect(estrategiaRepo.actualizar).toHaveBeenCalledWith('EST-1', { resultadoCalculo: 'posible' });
  });

  it('calcularEstrategiaDetallada => imposible cuando falta inventario (80 < 100)', async () => {
    cantidadDisponible = 80;
    const resultado = await service.calcularEstrategiaDetallada('EST-1');

    expect(resultado.resultadoGeneral).toBe('imposible');
    expect(resultado.productos[0].recursos[0].deficit).toBe(20);
  });

  it('emite un evento de auditoría CALCULAR_VIABILIDAD (patrón Observer)', async () => {
    await service.calcularEstrategiaDetallada('EST-1', undefined, 'USR-1');

    expect(auditoria.emitir).toHaveBeenCalledTimes(1);
    const evento = auditoria.emitir.mock.calls[0][0];
    expect(evento.accion).toBe(AccionAuditoria.CALCULAR_VIABILIDAD);
    expect(evento.entidadId).toBe('EST-1');
    expect(evento.usuarioId).toBe('USR-1');
  });
});
