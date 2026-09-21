import { Logger } from '@nestjs/common';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { EmailService } from './email.service.js';

describe('EmailService', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('nunca escreve o código de confirmação no log', async () => {
    const log = vi.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    const error = vi
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => {});

    await new EmailService().sendConfirmationCode('aluno@email.com', '654321');

    const escrito = JSON.stringify([...log.mock.calls, ...error.mock.calls]);
    expect(escrito).not.toContain('654321');
    expect(escrito).toContain('aluno@email.com');
  });
});
