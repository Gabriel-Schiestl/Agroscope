import { MigrationInterface, QueryRunner } from 'typeorm';

const RUST_ID = '11111111-0000-0000-0000-000000000009';
const PHOMA_ID = '11111111-0000-0000-0000-000000000010';

export class SeedCoffeeSicknesses1748000000016 implements MigrationInterface {
    name = 'SeedCoffeeSicknesses1748000000016';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Coffee — Ferrugem do Cafeeiro (Coffee Leaf Rust) — Hemileia vastatrix
        await queryRunner.query(`
            INSERT INTO "sickness" (
                "id", "name", "description", "symptoms",
                "temperature_min", "temperature_max", "temperature_optimal",
                "humidity_min", "humidity_max",
                "rainfall_dependency", "favorable_seasons"
            ) VALUES (
                '${RUST_ID}',
                'Rust',
                'Ferrugem do cafeeiro causada pelo fungo Hemileia vastatrix. É a doença mais destrutiva da cafeicultura mundial, favorecida por temperaturas amenas e alta umidade, podendo causar desfolha severa e quebra de produtividade em anos consecutivos.',
                ARRAY[
                    'Pequenas manchas cloróticas amarelo-alaranjadas na face superior das folhas',
                    'Pústulas pulverulentas de coloração alaranjada (urediniósporos) na face inferior, correspondentes às manchas superiores',
                    'Coalescência das lesões formando áreas necróticas irregulares',
                    'Desfolha precoce e intensa em ataques severos',
                    'Enfraquecimento da planta e seca de ramos em infecções recorrentes'
                ],
                21, 25, 23,
                80, 100,
                'high',
                ARRAY['spring', 'summer']
            ) ON CONFLICT ("id") DO NOTHING
        `);

        // Coffee — Mancha de Phoma / Requeima (Phoma Leaf Spot) — Phoma spp. (P. costarricensis / P. tarda)
        await queryRunner.query(`
            INSERT INTO "sickness" (
                "id", "name", "description", "symptoms",
                "temperature_min", "temperature_max", "temperature_optimal",
                "humidity_min", "humidity_max",
                "rainfall_dependency", "favorable_seasons"
            ) VALUES (
                '${PHOMA_ID}',
                'Phoma',
                'Mancha de phoma (requeima) do cafeeiro causada por fungos do gênero Phoma. Diferentemente da ferrugem, é favorecida por temperaturas baixas e ocorre principalmente após geadas, granizo ou ferimentos mecânicos, sendo comum em lavouras de altitude elevada.',
                ARRAY[
                    'Lesões necróticas de coloração marrom-escura a preta, geralmente iniciando pelas bordas ou ápice das folhas',
                    'Manchas associadas a injúrias por frio, geada ou granizo',
                    'Necrose e queda de flores e frutos jovens em ataques severos ("phoma da florada")',
                    'Lesões escuras e deprimidas em ramos novos'
                ],
                10, 18, 14,
                85, 100,
                'medium',
                ARRAY['winter']
            ) ON CONFLICT ("id") DO NOTHING
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM "sickness" WHERE "id" = ANY(ARRAY[
                '${RUST_ID}',
                '${PHOMA_ID}'
            ]::uuid[])
        `);
    }
}
