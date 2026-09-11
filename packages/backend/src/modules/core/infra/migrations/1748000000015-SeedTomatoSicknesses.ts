import { MigrationInterface, QueryRunner } from 'typeorm';

const BACTERIAL_SPOT_ID = '11111111-0000-0000-0000-000000000007';
const LEAF_MOLD_ID = '11111111-0000-0000-0000-000000000008';

export class SeedTomatoSicknesses1748000000015 implements MigrationInterface {
    name = 'SeedTomatoSicknesses1748000000015';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Tomato — Pinta Bacteriana (Bacterial Spot) — Xanthomonas spp.
        await queryRunner.query(`
            INSERT INTO "sickness" (
                "id", "name", "description", "symptoms",
                "temperature_min", "temperature_max", "temperature_optimal",
                "humidity_min", "humidity_max",
                "rainfall_dependency", "favorable_seasons"
            ) VALUES (
                '${BACTERIAL_SPOT_ID}',
                'Bacterial_Spot',
                'Pinta bacteriana do tomateiro causada por espécies de Xanthomonas. Dissemina-se rapidamente sob chuva e irrigação por aspersão, podendo comprometer folhas, hastes e frutos.',
                ARRAY[
                    'Pequenas lesões encharcadas nas folhas que evoluem para manchas escuras com halo amarelado',
                    'Lesões coalescentes causando desfolha precoce em ataques severos',
                    'Manchas escuras e ásperas (crostosas) sobre os frutos',
                    'Lesões alongadas e escuras nas hastes e pecíolos'
                ],
                24, 32, 28,
                80, 100,
                'high',
                ARRAY['summer']
            ) ON CONFLICT ("id") DO NOTHING
        `);

        // Tomato — Mofo/Requeima das Folhas (Leaf Mold) — Fulvia fulva (Passalora fulva)
        await queryRunner.query(`
            INSERT INTO "sickness" (
                "id", "name", "description", "symptoms",
                "temperature_min", "temperature_max", "temperature_optimal",
                "humidity_min", "humidity_max",
                "rainfall_dependency", "favorable_seasons"
            ) VALUES (
                '${LEAF_MOLD_ID}',
                'Leaf_Mold',
                'Mofo-das-folhas do tomateiro causado pelo fungo Fulvia fulva (sin. Passalora fulva). É especialmente comum em cultivos protegidos (estufas) com alta umidade relativa do ar e ventilação insuficiente.',
                ARRAY[
                    'Manchas amarelo-esverdeadas de contorno difuso na face superior das folhas',
                    'Mofo aveludado de coloração verde-oliva a cinza-arroxeada na face inferior das folhas',
                    'Enrolamento, secamento e queda precoce das folhas em infecções severas',
                    'Maior incidência em ambientes com baixa circulação de ar'
                ],
                18, 26, 22,
                85, 100,
                'medium',
                ARRAY['autumn', 'winter']
            ) ON CONFLICT ("id") DO NOTHING
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM "sickness" WHERE "id" = ANY(ARRAY[
                '${BACTERIAL_SPOT_ID}',
                '${LEAF_MOLD_ID}'
            ]::uuid[])
        `);
    }
}
