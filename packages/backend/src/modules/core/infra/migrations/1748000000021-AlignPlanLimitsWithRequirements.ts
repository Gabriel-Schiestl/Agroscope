import { MigrationInterface, QueryRunner } from 'typeorm';
import { FREE_PLAN_ID } from './1748000000004-SeedFreePlan';
import { PREMIUM_PLAN_ID, PRO_PLAN_ID } from './1748000000007-SeedPaidPlans';

const PLANS = {
    free: {
        imageLimit: 1,
        chatLimit: 0,
        features: '["Apenas a análise mais recente fica no histórico"]',
        featureFlags: '[]',
    },
    pro: {
        imageLimit: 10,
        chatLimit: 10,
        features:
            '["Histórico completo de análises", "Relatório em PDF de cada análise"]',
        featureFlags: '["REPORT_GENERATION", "FULL_HISTORY"]',
    },
    premium: {
        imageLimit: 30,
        chatLimit: 30,
        features:
            '["Histórico completo de análises", "Relatório em PDF de cada análise"]',
        featureFlags: '["REPORT_GENERATION", "FULL_HISTORY"]',
    },
};

const PREVIOUS = {
    free: { imageLimit: 10, chatLimit: 50, features: '[]', featureFlags: '[]' },
    pro: {
        imageLimit: 100,
        chatLimit: 300,
        features: '["Relatório em PDF de cada análise"]',
        featureFlags: '["REPORT_GENERATION"]',
    },
    premium: {
        imageLimit: 500,
        chatLimit: 1000,
        features: '["Relatório em PDF de cada análise"]',
        featureFlags: '["REPORT_GENERATION"]',
    },
};

type PlanValues = (typeof PLANS)['free'];

async function applyPlan(
    queryRunner: QueryRunner,
    id: string,
    values: PlanValues,
): Promise<void> {
    await queryRunner.query(
        `UPDATE "plan"
            SET "image_limit" = $1,
                "chat_limit" = $2,
                "features" = $3::jsonb,
                "feature_flags" = $4::jsonb
          WHERE "id" = $5`,
        [
            values.imageLimit,
            values.chatLimit,
            values.features,
            values.featureFlags,
            id,
        ],
    );
}

export class AlignPlanLimitsWithRequirements1748000000021
    implements MigrationInterface
{
    name = 'AlignPlanLimitsWithRequirements1748000000021';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await applyPlan(queryRunner, FREE_PLAN_ID, PLANS.free);
        await applyPlan(queryRunner, PRO_PLAN_ID, PLANS.pro);
        await applyPlan(queryRunner, PREMIUM_PLAN_ID, PLANS.premium);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await applyPlan(queryRunner, FREE_PLAN_ID, PREVIOUS.free);
        await applyPlan(queryRunner, PRO_PLAN_ID, PREVIOUS.pro);
        await applyPlan(queryRunner, PREMIUM_PLAN_ID, PREVIOUS.premium);
    }
}
