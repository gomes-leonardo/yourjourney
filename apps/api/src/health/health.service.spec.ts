import { HealthService } from './health.service.js';

/**
 * Repare que este teste não sobe o NestJS e não sobe servidor nenhum: ele
 * cria a classe na mão. Isso só é possível porque o service não conhece HTTP,
 * e é a razão de a separação do MVC valer a pena.
 */
describe('HealthService', () => {
  const service = new HealthService();

  it('responde com status ok', () => {
    expect(service.check().status).toBe('ok');
  });

  it('identifica qual serviço respondeu', () => {
    expect(service.check().service).toBe('yourjourney-api');
  });

  it('devolve um timestamp válido em ISO 8601', () => {
    expect(Number.isNaN(Date.parse(service.check().timestamp))).toBe(false);
  });

  it('devolve o tempo no ar como número inteiro de segundos', () => {
    const { uptimeSeconds } = service.check();

    expect(Number.isInteger(uptimeSeconds)).toBe(true);
    expect(uptimeSeconds).toBeGreaterThanOrEqual(0);
  });
});
