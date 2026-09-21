import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEmailConfirmationCodesTable1790033166656 implements MigrationInterface {
  name = 'CreateEmailConfirmationCodesTable1790033166656';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "email_confirmation_codes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code_hash" character varying NOT NULL, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "attempts" integer NOT NULL DEFAULT '0', "used_at" TIMESTAMP WITH TIME ZONE, "invalidated_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, CONSTRAINT "PK_4625ddcbdb342246349422503aa" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_email_confirmation_codes_active_user" ON "email_confirmation_codes"  ("user_id") WHERE "used_at" IS NULL AND "invalidated_at" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_confirmation_codes" ADD CONSTRAINT "FK_f40ced39c57928390ae5ab19872" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "email_confirmation_codes" DROP CONSTRAINT "FK_f40ced39c57928390ae5ab19872"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."UQ_email_confirmation_codes_active_user"`,
    );
    await queryRunner.query(`DROP TABLE "email_confirmation_codes"`);
  }
}
