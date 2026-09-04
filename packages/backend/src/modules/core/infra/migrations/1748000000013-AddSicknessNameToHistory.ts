import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSicknessNameToHistory1748000000013 implements MigrationInterface {
    name = 'AddSicknessNameToHistory1748000000013';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "history" ADD COLUMN IF NOT EXISTS "sickness_name" varchar NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "history" DROP COLUMN IF EXISTS "sickness_name"
        `);
    }
}
