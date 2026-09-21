import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as bcrypt from 'bcrypt';
import { AppConfigService } from '../config/app-config.service.js';
import {
  ConfirmationCodeAlreadyUsedException,
  ConfirmationCodeAttemptsExceededException,
  ConfirmationCodeNotFoundException,
  ExpiredConfirmationCodeException,
  IncorrectConfirmationCodeException,
} from './email-confirmation.errors.js';
import {
  EmailConfirmationRepository,
  type LatestCodeState,
} from './email-confirmation.repository.js';
import { EmailConfirmationService } from './email-confirmation.service.js';

const USER_ID = 'uuid-do-aluno';
const MAX_ATTEMPTS = 3;
const TTL_MINUTES = 10;
const CODIGO = '123456';

const estado = (parcial: Partial<LatestCodeState>): LatestCodeState => ({
  attempts: 0,
  used: false,
  invalidated: false,
  expired: false,
  ...parcial,
});

describe('EmailConfirmationService', () => {
  let service: EmailConfirmationService;
  let repository: {
    replaceActive: ReturnType<typeof vi.fn>;
    registerAttempt: ReturnType<typeof vi.fn>;
    markUsed: ReturnType<typeof vi.fn>;
    invalidate: ReturnType<typeof vi.fn>;
    findLatestState: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    repository = {
      replaceActive: vi.fn().mockResolvedValue(undefined),
      registerAttempt: vi.fn(),
      markUsed: vi.fn().mockResolvedValue(true),
      invalidate: vi.fn().mockResolvedValue(undefined),
      findLatestState: vi.fn(),
    };

    const config = {
      confirmationCodeTtlMinutes: TTL_MINUTES,
      confirmationCodeMaxAttempts: MAX_ATTEMPTS,
    } as AppConfigService;

    service = new EmailConfirmationService(
      repository as unknown as EmailConfirmationRepository,
      config,
    );
  });

  describe('issue', () => {
    it('devolve um código de 6 dígitos', async () => {
      await expect(service.issue(USER_ID)).resolves.toMatch(/^\d{6}$/);
    });

    it('guarda o hash do código, nunca o código', async () => {
      const codigo = await service.issue(USER_ID);

      const [userId, guardado, ttl] = repository.replaceActive.mock.calls[0];
      expect(userId).toBe(USER_ID);
      expect(guardado).not.toBe(codigo);
      expect(guardado).not.toContain(codigo);
      expect(await bcrypt.compare(codigo, guardado)).toBe(true);
      expect(ttl).toBe(TTL_MINUTES);
    });

    it('substitui o código anterior do mesmo usuário a cada pedido', async () => {
      await service.issue(USER_ID);
      await service.issue(USER_ID);

      expect(repository.replaceActive).toHaveBeenCalledTimes(2);
      expect(repository.replaceActive).toHaveBeenNthCalledWith(
        2,
        USER_ID,
        expect.any(String),
        TTL_MINUTES,
      );
    });
  });

  describe('verify', () => {
    const tentativa = async (attempts: number) => ({
      id: 'uuid-do-codigo',
      codeHash: await bcrypt.hash(CODIGO, 4),
      attempts,
    });

    it('aceita o código correto e o marca como usado', async () => {
      repository.registerAttempt.mockResolvedValue(await tentativa(1));

      await expect(service.verify(USER_ID, CODIGO)).resolves.toBeUndefined();

      expect(repository.registerAttempt).toHaveBeenCalledWith(
        USER_ID,
        MAX_ATTEMPTS,
      );
      expect(repository.markUsed).toHaveBeenCalledWith('uuid-do-codigo');
    });

    it('recusa código incorreto sem marcá-lo como usado', async () => {
      repository.registerAttempt.mockResolvedValue(await tentativa(1));

      await expect(service.verify(USER_ID, '000000')).rejects.toThrow(
        IncorrectConfirmationCodeException,
      );

      expect(repository.markUsed).not.toHaveBeenCalled();
      expect(repository.invalidate).not.toHaveBeenCalled();
    });

    it('invalida o código no último chute errado', async () => {
      repository.registerAttempt.mockResolvedValue(
        await tentativa(MAX_ATTEMPTS),
      );

      await expect(service.verify(USER_ID, '000000')).rejects.toThrow(
        ConfirmationCodeAttemptsExceededException,
      );

      expect(repository.invalidate).toHaveBeenCalledWith('uuid-do-codigo');
    });

    it('recusa código expirado, com um erro diferente do de código incorreto', async () => {
      repository.registerAttempt.mockResolvedValue(null);
      repository.findLatestState.mockResolvedValue(estado({ expired: true }));

      const erro = await service.verify(USER_ID, CODIGO).catch((e) => e);

      expect(erro).toBeInstanceOf(ExpiredConfirmationCodeException);
      expect(erro).not.toBeInstanceOf(IncorrectConfirmationCodeException);
      expect(erro.getResponse().code).toBe('CONFIRMATION_CODE_EXPIRED');
    });

    it('depois do limite de tentativas recusa até o chute certo', async () => {
      repository.registerAttempt.mockResolvedValue(null);
      repository.findLatestState.mockResolvedValue(
        estado({ attempts: MAX_ATTEMPTS, invalidated: true }),
      );

      await expect(service.verify(USER_ID, CODIGO)).rejects.toThrow(
        ConfirmationCodeAttemptsExceededException,
      );

      expect(repository.markUsed).not.toHaveBeenCalled();
    });

    it('recusa código que já foi usado', async () => {
      repository.registerAttempt.mockResolvedValue(null);
      repository.findLatestState.mockResolvedValue(estado({ used: true }));

      await expect(service.verify(USER_ID, CODIGO)).rejects.toThrow(
        ConfirmationCodeAlreadyUsedException,
      );
    });

    it('recusa quando outra requisição usou o código no mesmo instante', async () => {
      repository.registerAttempt.mockResolvedValue(await tentativa(1));
      repository.markUsed.mockResolvedValue(false);

      await expect(service.verify(USER_ID, CODIGO)).rejects.toThrow(
        ConfirmationCodeAlreadyUsedException,
      );
    });

    it('recusa quando o usuário não tem nenhum código', async () => {
      repository.registerAttempt.mockResolvedValue(null);
      repository.findLatestState.mockResolvedValue(null);

      await expect(service.verify(USER_ID, CODIGO)).rejects.toThrow(
        ConfirmationCodeNotFoundException,
      );
    });
  });
});
