import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddClimateValidationToHistory1748000000017
    implements MigrationInterface
{
    name = 'AddClimateValidationToHistory1748000000017';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "history"
            ADD COLUMN IF NOT EXISTS "climate_validation" jsonb NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "history" DROP COLUMN IF EXISTS "climate_validation"
        `);
    }
}
