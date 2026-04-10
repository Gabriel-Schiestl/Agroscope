import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPrecautionsToHistory1748000000003 implements MigrationInterface {
    name = 'AddPrecautionsToHistory1748000000003';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "history"
                ADD COLUMN IF NOT EXISTS "precautions" TEXT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "history"
                DROP COLUMN IF EXISTS "precautions"
        `);
    }
}
