import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuditoriaService } from './Auditoria.service';
import { Auditoria } from './ENTITY/Auditoria.entity';
import { AccionAuditoria, AuditoriaEvento, ResultadoAuditoria } from './EVENTS/auditoria.event';

describe('Patrón Observer - AuditoriaService', () => {
  let service: AuditoriaService;
  let repo: { create: jest.Mock; save: jest.Mock; find: jest.Mock };

  beforeEach(async () => {
    repo = {
      create: jest.fn((x) => x),
      save: jest.fn((x) => Promise.resolve({ id: 'AUD-1', ...x })),
      find: jest.fn(() => Promise.resolve([])),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditoriaService,
        { provide: getRepositoryToken(Auditoria), useValue: repo },
      ],
    }).compile();

    service = module.get<AuditoriaService>(AuditoriaService);
  });

  it('persiste el evento recibido (reacción del observador)', async () => {
    const evento = new AuditoriaEvento({
      accion: AccionAuditoria.CREAR_ESTRATEGIA,
      entidad: 'Estrategia',
      entidadId: 'EST-1',
      usuarioId: 'USR-9',
    });

    await service.registrar(evento);

    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        accion: AccionAuditoria.CREAR_ESTRATEGIA,
        entidad: 'Estrategia',
        entidadId: 'EST-1',
        usuarioId: 'USR-9',
        resultado: ResultadoAuditoria.EXITO,
      }),
    );
    expect(repo.save).toHaveBeenCalledTimes(1);
  });

  it('nunca propaga errores de persistencia (no debe romper la operación de negocio)', async () => {
    repo.save.mockRejectedValueOnce(new Error('fallo de BD'));

    const evento = new AuditoriaEvento({
      accion: AccionAuditoria.CALCULAR_VIABILIDAD,
      entidad: 'Estrategia',
      entidadId: 'EST-2',
    });

    await expect(service.registrar(evento)).resolves.toBeUndefined();
  });

  it('filtra por entidad e ID al consultar la traza', async () => {
    await service.findByEntidad('Estrategia', 'EST-1');
    expect(repo.find).toHaveBeenCalledWith({
      where: { entidad: 'Estrategia', entidadId: 'EST-1' },
      order: { fechaHora: 'DESC' },
    });
  });
});
