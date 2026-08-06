import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCausesAndExplanationToHistory1748000000010
    implements MigrationInterface
{
    name = 'AddCausesAndExplanationToHistory1748000000010';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "history"
            ADD COLUMN IF NOT EXISTS "causes" text NULL
        `);

        await queryRunner.query(`
            ALTER TABLE "history"
            ADD COLUMN IF NOT EXISTS "explanation" character varying NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "history" DROP COLUMN IF EXISTS "explanation"
        `);

        await queryRunner.query(`
            ALTER TABLE "history" DROP COLUMN IF EXISTS "causes"
        `);
    }
}
