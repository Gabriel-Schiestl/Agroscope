import { MigrationInterface, QueryRunner } from "typeorm";

export class Db121746061606096 implements MigrationInterface {
    name = 'Db121746061606096'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "history"
            ADD "sickness_confidence" double precision
        `);
        await queryRunner.query(`
            ALTER TABLE "history"
            ADD "crop" character varying NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "history"
            ADD "crop_confidence" double precision NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "history" DROP COLUMN "crop_confidence"
        `);
        await queryRunner.query(`
            ALTER TABLE "history" DROP COLUMN "crop"
        `);
        await queryRunner.query(`
            ALTER TABLE "history" DROP COLUMN "sickness_confidence"
        `);
    }

}
