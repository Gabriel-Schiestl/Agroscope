import { MigrationInterface, QueryRunner } from 'typeorm';

const REQUEIMA_ID = '00000000-0000-0000-0000-000000000101';
const FERRUGEM_ID = '00000000-0000-0000-0000-000000000102';
const MANCHA_ALVO_ID = '00000000-0000-0000-0000-000000000103';

export class SeedMockSicknesses1748000000009 implements MigrationInterface {
    name = 'SeedMockSicknesses1748000000009';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO "sickness" ("id", "name", "description", "symptoms")
            VALUES (
                '${REQUEIMA_ID}',
                'Requeima',
                'Doença fúngica causada por Phytophthora infestans que ataca folhas, caules e frutos do tomateiro.',
                ARRAY['Manchas encharcadas nas folhas', 'Necrose foliar', 'Lesões escuras no caule']
            )
            ON CONFLICT ("id") DO NOTHING
        `);

        await queryRunner.query(`
            INSERT INTO "sickness" ("id", "name", "description", "symptoms")
            VALUES (
                '${FERRUGEM_ID}',
                'Ferrugem',
                'Doença fúngica causada por Puccinia sorghi que forma pústulas nas folhas do milho.',
                ARRAY['Pústulas de coloração ferrugem', 'Redução da área foliar', 'Amarelecimento das folhas']
            )
            ON CONFLICT ("id") DO NOTHING
        `);

        await queryRunner.query(`
            INSERT INTO "sickness" ("id", "name", "description", "symptoms")
            VALUES (
                '${MANCHA_ALVO_ID}',
                'Mancha Alvo',
                'Doença fúngica causada por Corynespora cassiicola que afeta as folhas da soja.',
                ARRAY['Lesões circulares com anéis concêntricos', 'Desfolha precoce']
            )
            ON CONFLICT ("id") DO NOTHING
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM "sickness" WHERE "id" IN ('${REQUEIMA_ID}', '${FERRUGEM_ID}', '${MANCHA_ALVO_ID}')
        `);
    }
}
