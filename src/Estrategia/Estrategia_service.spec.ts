import { Test, TestingModule } from '@nestjs/testing';
import { EstrategiaService } from './Estrategia_service';
import { ESTRATEGIA_REPOSITORY } from '../DataBase/INTERFACES/IEstrategiaRepository';
import { INVENTARIO_REPOSITORY } from '../DataBase/INTERFACES/IInventarioRepository';
import { RELACION_PRODUCTO_RECURSO_REPOSITORY } from '../DataBase/INTERFACES/IRelacionProductoRecursoRepository';
import { CALCULO_ESTRATEGIA_REPOSITORY } from '../DataBase/INTERFACES/ICalculoEstrategiaRepository';
import { CalculoViabilidadBasico } from '../CalculoEstrategia/STRATEGIES/CalculoViabilidadBasico';
import { CalculoViabilidadAvanzado } from '../CalculoEstrategia/STRATEGIES/CalculoViabilidadAvanzado';
import { EstrategiaCalculoFactory } from '../CalculoEstrategia/STRATEGIES/EstrategiaCalculoFactory';
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

  beforeEach(async () => {
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
      buscarDisponiblesPorRecurso: jest.fn().mockResolvedValue([
        { almacenId: 'ALM-1', lote: 1, fabricante: 'F', fechaFabricacion: new Date(), fechaCaducidad: new Date(), cantidadDisponible: 100, unidadMedida: 'kg' },
      ]),
    };
    const calculoRepo = {
      buscarUltimoPorEstrategia: jest.fn().mockResolvedValue(null),
    };
    auditoria = { emitir: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EstrategiaService,
        CalculoViabilidadBasico,
        CalculoViabilidadAvanzado,
        EstrategiaCalculoFactory,
        { provide: ESTRATEGIA_REPOSITORY, useValue: estrategiaRepo },
        { provide: RELACION_PRODUCTO_RECURSO_REPOSITORY, useValue: relacionRepo },
        { provide: INVENTARIO_REPOSITORY, useValue: inventarioRepo },
        { provide: CALCULO_ESTRATEGIA_REPOSITORY, useValue: calculoRepo },
        { provide: AuditoriaPublisher, useValue: auditoria },
      ],
    }).compile();

    service = module.get<EstrategiaService>(EstrategiaService);
  });

  it('usa el algoritmo básico por defecto: existencia=100 cubre requerido=100 => posible', async () => {
    const resultado = await service.calcularEstrategiaDetallada('EST-1');

    expect(resultado.resultadoGeneral).toBe('posible');
    expect(estrategiaRepo.actualizar).toHaveBeenCalledWith('EST-1', { resultadoCalculo: 'posible' });
  });

  it('con el algoritmo avanzado el mismo caso es imposible (margen de seguridad)', async () => {
    const resultado = await service.calcularEstrategiaDetallada('EST-1', { algoritmo: 'avanzado' });

    expect(resultado.resultadoGeneral).toBe('imposible');
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
