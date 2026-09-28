import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMaterialsTable1790549380523 implements MigrationInterface {
  name = 'CreateMaterialsTable1790549380523';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "materials" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "file_name" character varying NOT NULL, "storage_path" character varying NOT NULL, "status" character varying NOT NULL DEFAULT 'recebido', "total_pages" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "CHK_materials_status" CHECK ("status" IN ('recebido', 'processando', 'pronto', 'falhou')), CONSTRAINT "PK_materials_id" PRIMARY KEY ("id"), CONSTRAINT "FK_fd1917860643281d11925241cc2" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "materials"`);
  }
}
