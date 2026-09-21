import { randomUUID } from 'node:crypto';
import { DataSource } from 'typeorm';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { AppConfigService } from '../config/app-config.service.js';
import { User } from '../users/models/user.entity.js';
import {
  ConfirmationCodeAlreadyUsedException,
  ConfirmationCodeAttemptsExceededException,
  ExpiredConfirmationCodeException,
} from './email-confirmation.errors.js';
import { EmailConfirmationRepository } from './email-confirmation.repository.js';
import { EmailConfirmationService } from './email-confirmation.service.js';
import { EmailConfirmationCode } from './models/email-confirmation-code.entity.js';

const databaseUrl = process.env.DATABASE_URL;
const describeDatabase = databaseUrl ? describe : describe.skip;

const MAX_ATTEMPTS = 3;

describeDatabase('EmailConfirmationService no banco', () => {
  let dataSource: DataSource;
  let service: EmailConfirmationService;
  const createdUsers: string[] = [];

  async function createUser(): Promise<string> {
    const id = randomUUID();
    await dataSource.query(
      `INSERT INTO "users" ("id", "name", "email", "password_hash")
       VALUES ($1, $2, $3, $4)`,
      [id, 'Usuário do teste', `${id}@example.com`, 'hash-de-teste'],
    );
    createdUsers.push(id);
    return id;
  }

  function activeCodes(userId: string): Promise<{ attempts: number }[]> {
    return dataSource.query(
      `SELECT attempts FROM email_confirmation_codes
        WHERE user_id = $1 AND used_at IS NULL AND invalidated_at IS NULL`,
      [userId],
    );
  }

  beforeAll(async () => {
    dataSource = new DataSource({
      type: 'postgres',
      url: databaseUrl,
      entities: [User, EmailConfirmationCode],
      migrations: ['src/database/migrations/*.ts'],
    });
    await dataSource.initialize();
    await dataSource.runMigrations();

    const config = {
      confirmationCodeTtlMinutes: 10,
      confirmationCodeMaxAttempts: MAX_ATTEMPTS,
    } as AppConfigService;

    service = new EmailConfirmationService(
      new EmailConfirmationRepository(
        dataSource.getRepository(EmailConfirmationCode),
      ),
      config,
    );
  });

  afterEach(async () => {
    if (createdUsers.length > 0) {
      await dataSource.query('DELETE FROM "users" WHERE "id" = ANY($1)', [
        createdUsers.splice(0),
      ]);
    }
  });

  afterAll(async () => {
    if (dataSource?.isInitialized) {
      await dataSource.destroy();
    }
  });

  it('confirma com o código certo e não deixa usar o mesmo código de novo', async () => {
    const userId = await createUser();
    const codigo = await service.issue(userId);

    await expect(service.verify(userId, codigo)).resolves.toBeUndefined();
    await expect(service.verify(userId, codigo)).rejects.toThrow(
      ConfirmationCodeAlreadyUsedException,
    );
  });

  it('recusa código expirado', async () => {
    const userId = await createUser();
    const codigo = await service.issue(userId);
    await dataSource.query(
      `UPDATE email_confirmation_codes
          SET expires_at = now() - interval '1 minute' WHERE user_id = $1`,
      [userId],
    );

    await expect(service.verify(userId, codigo)).rejects.toThrow(
      ExpiredConfirmationCodeException,
    );
  });

  it('gerar um código novo invalida o anterior', async () => {
    const userId = await createUser();
    const primeiro = await service.issue(userId);
    const segundo = await service.issue(userId);

    expect(await activeCodes(userId)).toHaveLength(1);
    await expect(service.verify(userId, primeiro)).rejects.toThrow();
    await expect(service.verify(userId, segundo)).resolves.toBeUndefined();
  });

  it('dois pedidos de código ao mesmo tempo deixam só um ativo', async () => {
    const userId = await createUser();

    await Promise.all([service.issue(userId), service.issue(userId)]);

    expect(await activeCodes(userId)).toHaveLength(1);
  });

  it('chutes errados em paralelo nunca passam do limite, e o código certo depois é recusado', async () => {
    const userId = await createUser();
    const codigo = await service.issue(userId);
    const errado = codigo === '000000' ? '000001' : '000000';

    await Promise.allSettled(
      Array.from({ length: 12 }, () => service.verify(userId, errado)),
    );

    const [{ attempts }] = await dataSource.query(
      'SELECT attempts FROM email_confirmation_codes WHERE user_id = $1',
      [userId],
    );
    expect(attempts).toBe(MAX_ATTEMPTS);
    await expect(service.verify(userId, codigo)).rejects.toThrow(
      ConfirmationCodeAttemptsExceededException,
    );
  });

  it('dois códigos certos ao mesmo tempo confirmam uma vez só', async () => {
    const userId = await createUser();
    const codigo = await service.issue(userId);

    const resultados = await Promise.allSettled([
      service.verify(userId, codigo),
      service.verify(userId, codigo),
    ]);

    expect(resultados.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
  });
});
