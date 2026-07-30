import { MigrationInterface, QueryRunner } from 'typeorm';

export const FREE_PLAN_ID = '00000000-0000-0000-0000-000000000001';

export class SeedFreePlan1748000000004 implements MigrationInterface {
    name = 'SeedFreePlan1748000000004';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO "plan" ("id", "type", "image_limit", "chat_limit", "features", "price")
            VALUES ('${FREE_PLAN_ID}', 'FREE', 10, 50, '[]'::jsonb, 0)
            ON CONFLICT ("id") DO NOTHING
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM "plan" WHERE "id" = '${FREE_PLAN_ID}'
        `);
    }
}
