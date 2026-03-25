import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFeaturesToPlanTable1746770000005 implements MigrationInterface {
    name = 'AddFeaturesToPlanTable1746770000005';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "plan" ADD COLUMN "features" jsonb DEFAULT '[]'::jsonb
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "plan" DROP COLUMN "features"
        `);
    }
}
