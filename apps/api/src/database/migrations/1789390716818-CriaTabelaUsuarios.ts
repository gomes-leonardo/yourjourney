import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Cria a tabela `usuarios` no PostgreSQL.
 */
export class CriaTabelaUsuarios1789390716818 implements MigrationInterface {
  name = 'CriaTabelaUsuarios1789390716818';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "usuarios" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "nome" character varying NOT NULL,
        "email" character varying NOT NULL,
        "senha_hash" character varying NOT NULL,
        "plano" character varying NOT NULL DEFAULT 'gratuito',
        "creditos_disponiveis" integer NOT NULL DEFAULT '10',
        "email_confirmado_em" TIMESTAMP WITH TIME ZONE,
        "criado_em" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "atualizado_em" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_usuarios_email" UNIQUE ("email"),
        CONSTRAINT "PK_usuarios_id" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "usuarios"`);
  }
}
