import { MigrationInterface, QueryRunner } from 'typeorm';
import { PREMIUM_PLAN_ID, PRO_PLAN_ID } from './1748000000007-SeedPaidPlans';

export class RemovePremiumPlan1748000000023 implements MigrationInterface {
    name = 'RemovePremiumPlan1748000000023';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `UPDATE "user" SET "plan_id" = $1 WHERE "plan_id" = $2`,
            [PRO_PLAN_ID, PREMIUM_PLAN_ID],
        );

        await queryRunner.query(`DELETE FROM "plan" WHERE "id" = $1`, [
            PREMIUM_PLAN_ID,
        ]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `INSERT INTO "plan" ("id", "type", "image_limit", "chat_limit", "features", "feature_flags", "price")
             VALUES ($1, 'PREMIUM', 30, 30, $2::jsonb, $3::jsonb, 129.90)
             ON CONFLICT ("id") DO NOTHING`,
            [
                PREMIUM_PLAN_ID,
                '["Histórico completo de análises", "Relatório em PDF de cada análise"]',
                '["REPORT_GENERATION", "FULL_HISTORY"]',
            ],
        );
    }
}
