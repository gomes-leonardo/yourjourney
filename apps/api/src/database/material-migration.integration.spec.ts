import { randomUUID } from 'node:crypto';
import { DataSource } from 'typeorm';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

const databaseUrl = process.env.DATABASE_URL;
const describeDatabase = databaseUrl ? describe : describe.skip;

describeDatabase('Material migration', () => {
  let dataSource: DataSource;
  const createdUserIds = new Set<string>();

  beforeAll(async () => {
    dataSource = new DataSource({
      type: 'postgres',
      url: databaseUrl,
      migrations: ['src/database/migrations/*.ts'],
    });
    await dataSource.initialize();
    await dataSource.runMigrations();
  });

  afterAll(async () => {
    if (dataSource?.isInitialized) {
      await dataSource.destroy();
    }
  });

  afterEach(async () => {
    if (dataSource?.isInitialized) {
      for (const userId of createdUserIds) {
        await dataSource.query('DELETE FROM "users" WHERE "id" = $1', [userId]);
      }
      createdUserIds.clear();
    }
  });

  it('cria material com estado inicial recebido e total de páginas desconhecido', async () => {
    const userId = randomUUID();
    const materialId = randomUUID();

    await dataSource.query(
      `INSERT INTO "users" ("id", "name", "email", "password_hash")
       VALUES ($1, $2, $3, $4)`,
      [userId, 'Usuário do teste', `${userId}@example.com`, 'hash-de-teste'],
    );
    createdUserIds.add(userId);

    await dataSource.query(
      `INSERT INTO "materials" ("id", "user_id", "file_name", "storage_path")
       VALUES ($1, $2, $3, $4)`,
      [materialId, userId, 'apostila.pdf', `materials/${userId}/apostila.pdf`],
    );

    const [material] = await dataSource.query(
      'SELECT "file_name", "storage_path", "status", "total_pages", "created_at" FROM "materials" WHERE "id" = $1',
      [materialId],
    );
    expect(material).toMatchObject({
      file_name: 'apostila.pdf',
      storage_path: `materials/${userId}/apostila.pdf`,
      status: 'recebido',
      total_pages: null,
    });
    expect(material.created_at).toBeInstanceOf(Date);
  });

  it('recusa estado fora dos valores permitidos', async () => {
    const userId = randomUUID();

    await dataSource.query(
      `INSERT INTO "users" ("id", "name", "email", "password_hash")
       VALUES ($1, $2, $3, $4)`,
      [userId, 'Usuário do teste', `${userId}@example.com`, 'hash-de-teste'],
    );
    createdUserIds.add(userId);

    await expect(
      dataSource.query(
        `INSERT INTO "materials" ("user_id", "file_name", "storage_path", "status")
         VALUES ($1, $2, $3, $4)`,
        [
          userId,
          'apostila.pdf',
          `materials/${userId}/apostila.pdf`,
          'desconhecido',
        ],
      ),
    ).rejects.toMatchObject({ driverError: { code: '23514' } });
  });

  it('recusa material sem dono', async () => {
    await expect(
      dataSource.query(
        `INSERT INTO "materials" ("user_id", "file_name", "storage_path")
         VALUES (NULL, $1, $2)`,
        ['apostila.pdf', 'materials/apostila.pdf'],
      ),
    ).rejects.toMatchObject({ driverError: { code: '23502' } });
  });
});
