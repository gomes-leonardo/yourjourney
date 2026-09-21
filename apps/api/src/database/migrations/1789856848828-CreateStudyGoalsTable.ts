import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateStudyGoalsTable1789856848828 implements MigrationInterface {
  name = 'CreateStudyGoalsTable1789856848828';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "study_goals" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "exam_type" character varying NOT NULL, "taxonomy" character varying NOT NULL, "exam_date" date NOT NULL, "weekly_hours" integer NOT NULL, "difficult_subjects" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_study_goals_id" PRIMARY KEY ("id"), CONSTRAINT "FK_4021b5192595687e9b17480cc59" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "study_goals"`);
  }
}
