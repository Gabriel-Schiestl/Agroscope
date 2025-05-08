import { MigrationInterface, QueryRunner } from "typeorm";

export class Db131746662566961 implements MigrationInterface {
    name = 'Db131746662566961'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "authentication"
            ADD "incorrectRecoveryAttempts" integer
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "authentication" DROP COLUMN "incorrectRecoveryAttempts"
        `);
    }

}
