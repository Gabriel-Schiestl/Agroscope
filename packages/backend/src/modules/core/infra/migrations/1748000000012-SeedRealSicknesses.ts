import { MigrationInterface, QueryRunner } from 'typeorm';

const MOCK_IDS = [
    '00000000-0000-0000-0000-000000000101',
    '00000000-0000-0000-0000-000000000102',
    '00000000-0000-0000-0000-000000000103',
];

const RUST_BLIGHT_ID    = '11111111-0000-0000-0000-000000000001';
const RUST_COMMON_ID    = '11111111-0000-0000-0000-000000000002';
const BROWN_RUST_ID     = '11111111-0000-0000-0000-000000000003';
const YELLOW_RUST_ID    = '11111111-0000-0000-0000-000000000004';
const SOYBEAN_RUST_ID   = '11111111-0000-0000-0000-000000000005';
const TARGET_SPOT_ID    = '11111111-0000-0000-0000-000000000006';

export class SeedRealSicknesses1748000000012 implements MigrationInterface {
    name = 'SeedRealSicknesses1748000000012';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM "sickness" WHERE "id" = ANY(ARRAY[${MOCK_IDS.map(id => `'${id}'`).join(',')}]::uuid[])
        `);

        // Corn — Ferrugem Polissora (Southern Corn Rust) — Puccinia polysora
        await queryRunner.query(`
            INSERT INTO "sickness" (
                "id", "name", "description", "symptoms",
                "temperature_min", "temperature_max", "temperature_optimal",
                "humidity_min", "humidity_max",
                "rainfall_dependency", "favorable_seasons"
            ) VALUES (
                '${RUST_BLIGHT_ID}',
                'Rust_Blight',
                'Ferrugem polissora do milho causada por Puccinia polysora. Ocorre com maior frequência em regiões tropicais e subtropicais, podendo causar perdas significativas de produtividade em condições favoráveis.',
                ARRAY[
                    'Pústulas ovais a circulares de coloração castanho-alaranjada na face abaxial das folhas',
                    'Clorose ao redor das lesões em infecções severas',
                    'Redução da área foliar fotossintética',
                    'Senescência precoce das folhas em casos graves'
                ],
                22, 30, 26,
                80, 100,
                'medium',
                ARRAY['spring', 'summer']
            ) ON CONFLICT ("id") DO NOTHING
        `);

        // Corn — Ferrugem Comum (Common Corn Rust) — Puccinia sorghi
        await queryRunner.query(`
            INSERT INTO "sickness" (
                "id", "name", "description", "symptoms",
                "temperature_min", "temperature_max", "temperature_optimal",
                "humidity_min", "humidity_max",
                "rainfall_dependency", "favorable_seasons"
            ) VALUES (
                '${RUST_COMMON_ID}',
                'Rust_Common',
                'Ferrugem comum do milho causada por Puccinia sorghi. É a ferrugem mais disseminada em regiões de clima temperado a subtropical, com ciclos epidêmicos favorecidos por temperaturas amenas e alta umidade.',
                ARRAY[
                    'Pústulas alongadas de coloração ferrugem a marrom-escura em ambas as faces das folhas',
                    'Halos cloróticos ao redor das uredínias',
                    'Coalescência de lesões em infecções severas causando necrose foliar',
                    'Redução do enchimento de grãos em ataques precoces'
                ],
                15, 25, 20,
                75, 100,
                'medium',
                ARRAY['spring', 'autumn']
            ) ON CONFLICT ("id") DO NOTHING
        `);

        // Wheat — Ferrugem Parda / da Folha (Brown/Leaf Rust) — Puccinia triticina
        await queryRunner.query(`
            INSERT INTO "sickness" (
                "id", "name", "description", "symptoms",
                "temperature_min", "temperature_max", "temperature_optimal",
                "humidity_min", "humidity_max",
                "rainfall_dependency", "favorable_seasons"
            ) VALUES (
                '${BROWN_RUST_ID}',
                'Brown_Rust',
                'Ferrugem da folha do trigo causada por Puccinia triticina (sin. P. recondita). É a ferrugem mais comum e amplamente distribuída do trigo, com alto potencial epidêmico em condições de umidade e temperatura moderada.',
                ARRAY[
                    'Pústulas circulares a ovais de coloração laranja-avermelhada predominantemente na face adaxial das folhas',
                    'Teliósporos escuros formando estriações escuras no final do ciclo',
                    'Amarelecimento e secamento precoce das folhas em ataques severos',
                    'Redução de peso de grãos e rendimento'
                ],
                15, 22, 18,
                80, 100,
                'medium',
                ARRAY['spring', 'autumn']
            ) ON CONFLICT ("id") DO NOTHING
        `);

        // Wheat — Ferrugem Amarela / Linear (Yellow/Stripe Rust) — Puccinia striiformis
        await queryRunner.query(`
            INSERT INTO "sickness" (
                "id", "name", "description", "symptoms",
                "temperature_min", "temperature_max", "temperature_optimal",
                "humidity_min", "humidity_max",
                "rainfall_dependency", "favorable_seasons"
            ) VALUES (
                '${YELLOW_RUST_ID}',
                'Yellow_Rust',
                'Ferrugem amarela ou linear do trigo causada por Puccinia striiformis f. sp. tritici. Adapta-se a temperaturas mais baixas que as demais ferrugens e pode causar perdas totais de produção em epidemias severas.',
                ARRAY[
                    'Pústulas amarelas dispostas em estrias ou listras paralelas às nervuras das folhas',
                    'Pó amarelo-alaranjado (urediósporos) sobre as listras nas condições de alta umidade',
                    'Clorose intensa e necrose das folhas em infecções severas',
                    'Esterilidade de espiguetas e grãos chochos em ataques no período de espigamento'
                ],
                7, 15, 10,
                85, 100,
                'high',
                ARRAY['winter', 'spring']
            ) ON CONFLICT ("id") DO NOTHING
        `);

        // Soybean — Ferrugem Asiática (Asian Soybean Rust) — Phakopsora pachyrhizi
        await queryRunner.query(`
            INSERT INTO "sickness" (
                "id", "name", "description", "symptoms",
                "temperature_min", "temperature_max", "temperature_optimal",
                "humidity_min", "humidity_max",
                "rainfall_dependency", "favorable_seasons"
            ) VALUES (
                '${SOYBEAN_RUST_ID}',
                'Soybean_Rust',
                'Ferrugem asiática da soja causada por Phakopsora pachyrhizi. É considerada a doença mais destrutiva da soja no Brasil, com potencial de causar perdas de até 80% da produção quando não manejada adequadamente.',
                ARRAY[
                    'Lesões angulares de coloração cinza-esverdeada a marrom na face inferior das folhas',
                    'Pústulas (uredínias) de coloração bege a marrom com aspecto saliente na face abaxial',
                    'Desfolha precoce intensa a partir das folhas basais',
                    'Redução do número e tamanho de vagens e grãos',
                    'Halo clorótico ao redor das lesões em cultivares suscetíveis'
                ],
                18, 28, 22,
                80, 100,
                'medium',
                ARRAY['spring', 'summer']
            ) ON CONFLICT ("id") DO NOTHING
        `);

        // Soybean — Mancha Alvo (Target Spot) — Corynespora cassiicola
        await queryRunner.query(`
            INSERT INTO "sickness" (
                "id", "name", "description", "symptoms",
                "temperature_min", "temperature_max", "temperature_optimal",
                "humidity_min", "humidity_max",
                "rainfall_dependency", "favorable_seasons"
            ) VALUES (
                '${TARGET_SPOT_ID}',
                'Target_Spot',
                'Mancha alvo da soja causada por Corynespora cassiicola. Doença polífaga de importância crescente na soja brasileira, favorecida pelo plantio contínuo e pelo uso de cultivares suscetíveis. Pode coocorrer com a ferrugem asiática.',
                ARRAY[
                    'Lesões circulares a irregulares com anéis concêntricos característicos (padrão de alvo)',
                    'Centro necrótico de coloração marrom-clara a cinza cercado por halo amarelo',
                    'Lesões confluentes formando manchas maiores em condições favoráveis',
                    'Desfolha precoce em cultivares altamente suscetíveis',
                    'Manchas nas hastes e vagens em infecções severas'
                ],
                20, 30, 25,
                78, 100,
                'medium',
                ARRAY['summer']
            ) ON CONFLICT ("id") DO NOTHING
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM "sickness" WHERE "id" = ANY(ARRAY[
                '${RUST_BLIGHT_ID}',
                '${RUST_COMMON_ID}',
                '${BROWN_RUST_ID}',
                '${YELLOW_RUST_ID}',
                '${SOYBEAN_RUST_ID}',
                '${TARGET_SPOT_ID}'
            ]::uuid[])
        `);
    }
}
