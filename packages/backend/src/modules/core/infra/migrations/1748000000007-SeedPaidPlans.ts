import { MigrationInterface, QueryRunner } from 'typeorm';

export const PRO_PLAN_ID = '00000000-0000-0000-0000-000000000002';
export const PREMIUM_PLAN_ID = '00000000-0000-0000-0000-000000000003';

export class SeedPaidPlans1748000000007 implements MigrationInterface {
    name = 'SeedPaidPlans1748000000007';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO "plan" ("id", "type", "image_limit", "chat_limit", "features", "price")
            VALUES (
                '${PRO_PLAN_ID}',
                'PRO',
                100,
                300,
                '["Histórico completo de diagnósticos", "Suporte por e-mail prioritário", "Relatórios em PDF"]'::jsonb,
                49.90
            )
            ON CONFLICT ("id") DO NOTHING
        `);

        await queryRunner.query(`
            INSERT INTO "plan" ("id", "type", "image_limit", "chat_limit", "features", "price")
            VALUES (
                '${PREMIUM_PLAN_ID}',
                'PREMIUM',
                500,
                1000,
                '["Histórico completo de diagnósticos", "Suporte prioritário via WhatsApp", "Relatórios avançados em PDF", "Acesso antecipado a novas funcionalidades"]'::jsonb,
                129.90
            )
            ON CONFLICT ("id") DO NOTHING
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM "plan" WHERE "id" IN ('${PRO_PLAN_ID}', '${PREMIUM_PLAN_ID}')
        `);
    }
}
