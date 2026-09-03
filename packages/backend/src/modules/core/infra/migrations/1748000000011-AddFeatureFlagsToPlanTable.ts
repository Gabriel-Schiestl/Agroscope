import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFeatureFlagsToPlanTable1748000000011
    implements MigrationInterface
{
    name = 'AddFeatureFlagsToPlanTable1748000000011';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "plan" ADD COLUMN "feature_flags" jsonb DEFAULT '[]'::jsonb
        `);

        await queryRunner.query(`
            UPDATE "plan" SET "feature_flags" = '["REPORT_GENERATION"]'::jsonb
            WHERE "type" IN ('PRO', 'PREMIUM')
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "plan" DROP COLUMN "feature_flags"
        `);
    }
}
