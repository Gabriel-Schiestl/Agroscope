import { MigrationInterface, QueryRunner } from 'typeorm';

export class Db011731940949901 implements MigrationInterface {
  name = 'Db011731940949901';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "knowledge" (
                "id" uuid NOT NULL,
                "sicknessId" character varying NOT NULL,
                "handling" text NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_4159ba98b65a20a8d1f257bc514" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "sickness" (
                "id" uuid NOT NULL,
                "name" character varying NOT NULL,
                "description" character varying,
                "symptoms" text array NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_872f69f9f3244b9a062bb5180c5" PRIMARY KEY ("id")
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "sickness"
        `);
    await queryRunner.query(`
            DROP TABLE "knowledge"
        `);
  }
}
