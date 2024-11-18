import { MigrationInterface, QueryRunner } from "typeorm";

export class Db021731941104185 implements MigrationInterface {
    name = 'Db021731941104185'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "sickness" DROP COLUMN "symptoms"
        `);
        await queryRunner.query(`
            ALTER TABLE "sickness"
            ADD "symptoms" text array NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "sickness" DROP COLUMN "symptoms"
        `);
        await queryRunner.query(`
            ALTER TABLE "sickness"
            ADD "symptoms" text NOT NULL
        `);
    }

}
