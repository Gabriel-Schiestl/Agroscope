import { MigrationInterface, QueryRunner } from "typeorm";

export class Db021731973724463 implements MigrationInterface {
    name = 'Db021731973724463'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "knowledge" DROP COLUMN "sicknessId"
        `);
        await queryRunner.query(`
            ALTER TABLE "knowledge"
            ADD "sicknessId" uuid NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "knowledge"
            ADD CONSTRAINT "UQ_4b17eed0236cdebf24367846108" UNIQUE ("sicknessId")
        `);
        await queryRunner.query(`
            ALTER TABLE "knowledge"
            ADD CONSTRAINT "FK_4b17eed0236cdebf24367846108" FOREIGN KEY ("sicknessId") REFERENCES "sickness"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "knowledge" DROP CONSTRAINT "FK_4b17eed0236cdebf24367846108"
        `);
        await queryRunner.query(`
            ALTER TABLE "knowledge" DROP CONSTRAINT "UQ_4b17eed0236cdebf24367846108"
        `);
        await queryRunner.query(`
            ALTER TABLE "knowledge" DROP COLUMN "sicknessId"
        `);
        await queryRunner.query(`
            ALTER TABLE "knowledge"
            ADD "sicknessId" character varying NOT NULL
        `);
    }

}
