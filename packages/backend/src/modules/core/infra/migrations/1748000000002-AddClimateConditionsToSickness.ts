import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddClimateConditionsToSickness1748000000002
    implements MigrationInterface
{
    name = 'AddClimateConditionsToSickness1748000000002';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "sickness"
                ADD COLUMN IF NOT EXISTS "temperature_min"      DECIMAL(5, 2) NULL,
                ADD COLUMN IF NOT EXISTS "temperature_max"      DECIMAL(5, 2) NULL,
                ADD COLUMN IF NOT EXISTS "temperature_optimal"  DECIMAL(5, 2) NULL,
                ADD COLUMN IF NOT EXISTS "humidity_min"         DECIMAL(5, 2) NULL,
                ADD COLUMN IF NOT EXISTS "humidity_max"         DECIMAL(5, 2) NULL,
                ADD COLUMN IF NOT EXISTS "rainfall_dependency"  VARCHAR(10)   NULL
                    CHECK (rainfall_dependency IN ('low', 'medium', 'high')),
                ADD COLUMN IF NOT EXISTS "favorable_seasons"    TEXT[]        NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "sickness"
                DROP COLUMN IF EXISTS "temperature_min",
                DROP COLUMN IF EXISTS "temperature_max",
                DROP COLUMN IF EXISTS "temperature_optimal",
                DROP COLUMN IF EXISTS "humidity_min",
                DROP COLUMN IF EXISTS "humidity_max",
                DROP COLUMN IF EXISTS "rainfall_dependency",
                DROP COLUMN IF EXISTS "favorable_seasons"
        `);
    }
}
