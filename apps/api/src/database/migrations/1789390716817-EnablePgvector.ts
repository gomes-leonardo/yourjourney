import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Habilita a extensão pgvector.
 *
 * Ela acrescenta ao PostgreSQL o tipo de coluna `vector` e os operadores de
 * distância usados na busca por similaridade. É o que torna este banco, além
 * de relacional, também o nosso banco vetorial.
 *
 * Isto já foi feito por um script que rodava na criação do contêiner, mas
 * aquele script só executa em banco novo: quem já tinha o volume criado nunca
 * recebia a extensão. Como migração, vale para todo mundo.
 */
export class EnablePgvector1789390716817 implements MigrationInterface {
  name = 'EnablePgvector1789390716817';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS vector');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP EXTENSION IF EXISTS vector');
  }
}
