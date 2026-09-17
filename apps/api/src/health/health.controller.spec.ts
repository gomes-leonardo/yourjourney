import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller.js';
import { HealthService } from './health.service.js';

describe('HealthController', () => {
  let controller: HealthController;

  const respostaDoService = {
    status: 'ok' as const,
    service: 'servico-de-mentira',
    uptimeSeconds: 42,
    timestamp: '2026-01-01T00:00:00.000Z',
  };

  beforeEach(async () => {
    const modulo: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthService,
          useValue: { check: () => respostaDoService },
        },
      ],
    }).compile();

    controller = modulo.get<HealthController>(HealthController);
  });

  it('devolve exatamente o que o service respondeu, sem alterar nada', () => {
    expect(controller.check()).toEqual(respostaDoService);
  });
});
