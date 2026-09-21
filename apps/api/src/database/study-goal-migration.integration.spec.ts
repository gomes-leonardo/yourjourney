import { randomUUID } from 'node:crypto';
import { DataSource } from 'typeorm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const databaseUrl = process.env.DATABASE_URL;
const describeDatabase = databaseUrl ? describe : describe.skip;

describeDatabase('StudyGoal migration', () => {
  let dataSource: DataSource;

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

  it('recusa objetivo sem dono', async () => {
    await expect(
      dataSource.query(
        `INSERT INTO "study_goals" ("user_id", "exam_type", "taxonomy", "exam_date", "weekly_hours", "difficult_subjects")
         VALUES (NULL, $1, $2, $3, $4, $5)`,
        ['ENEM', 'ENEM', '2026-11-01', 10, 'Matemática'],
      ),
    ).rejects.toThrow();
  });

  it('apaga objetivo quando o dono é removido', async () => {
    const userId = randomUUID();
    const goalId = randomUUID();

    await dataSource.query(
      `INSERT INTO "users" ("id", "name", "email", "password_hash")
       VALUES ($1, $2, $3, $4)`,
      [userId, 'Usuário do teste', `${userId}@example.com`, 'hash-de-teste'],
    );
    await dataSource.query(
      `INSERT INTO "study_goals" ("id", "user_id", "exam_type", "taxonomy", "exam_date", "weekly_hours", "difficult_subjects")
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [goalId, userId, 'ENEM', 'ENEM', '2026-11-01', 10, 'Matemática'],
    );

    await dataSource.query('DELETE FROM "users" WHERE "id" = $1', [userId]);

    const [objetivo] = await dataSource.query(
      'SELECT "id" FROM "study_goals" WHERE "id" = $1',
      [goalId],
    );
    expect(objetivo).toBeUndefined();
  });
});
