import { MigrationInterface, QueryRunner } from 'typeorm';
import { PREMIUM_PLAN_ID, PRO_PLAN_ID } from './1748000000007-SeedPaidPlans';

// Os textos de benefícios dos planos pagos citavam recursos que a aplicação não
// oferece (suporte por e-mail/WhatsApp, acesso antecipado, relatórios
// "avançados"). Os dois planos liberam o mesmo recurso extra (REPORT_GENERATION);
// a diferença entre eles está nos limites de análises e de mensagens à Íris.
const PAID_FEATURES = '["Relatório em PDF de cada análise"]';

const OLD_PRO_FEATURES =
    '["Histórico completo de diagnósticos", "Suporte por e-mail prioritário", "Relatórios em PDF"]';
const OLD_PREMIUM_FEATURES =
    '["Histórico completo de diagnósticos", "Suporte prioritário via WhatsApp", "Relatórios avançados em PDF", "Acesso antecipado a novas funcionalidades"]';

export class AlignPlanFeatures1748000000020 implements MigrationInterface {
    name = 'AlignPlanFeatures1748000000020';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `UPDATE "plan" SET "features" = $1::jsonb WHERE "id" IN ($2, $3)`,
            [PAID_FEATURES, PRO_PLAN_ID, PREMIUM_PLAN_ID],
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `UPDATE "plan" SET "features" = $1::jsonb WHERE "id" = $2`,
            [OLD_PRO_FEATURES, PRO_PLAN_ID],
        );
        await queryRunner.query(
            `UPDATE "plan" SET "features" = $1::jsonb WHERE "id" = $2`,
            [OLD_PREMIUM_FEATURES, PREMIUM_PLAN_ID],
        );
    }
}
