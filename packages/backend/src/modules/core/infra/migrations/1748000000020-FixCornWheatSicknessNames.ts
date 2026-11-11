import { MigrationInterface, QueryRunner } from 'typeorm';

// Os modelos v2 de milho e trigo passaram a usar nomes de classe diferentes
// dos que foram seedados em SeedRealSicknesses/ReviewSicknessClimateConditions.
// O lookup (SicknessData.repository.ts) faz match exato de (crop, name), então
// o mismatch resultava em "Sickness not found" para toda predição de ferrugem
// do milho e qualquer doença de trigo.
const CORN_BLIGHT_ID = '11111111-0000-0000-0000-000000000001'; // antes "Rust_Blight" (ferrugem polissora)
const CORN_COMMON_RUST_ID = '11111111-0000-0000-0000-000000000002'; // antes "Rust_Common"
const WHEAT_RUST_COMMON_ID = '11111111-0000-0000-0000-000000000003'; // antes "Brown_Rust"
const WHEAT_BLIGHT_ID = '11111111-0000-0000-0000-000000000004'; // antes "Yellow_Rust"

export class FixCornWheatSicknessNames1748000000020
    implements MigrationInterface
{
    name = 'FixCornWheatSicknessNames1748000000020';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // CORN: mesmo patógeno (Puccinia sorghi) — só ajusta a ordem das
        // palavras pra bater com a classe "Common_Rust" que o modelo v2 retorna.
        await queryRunner.query(
            `UPDATE "sickness" SET "name" = 'Common_Rust', "updated_at" = CURRENT_TIMESTAMP WHERE "id" = $1`,
            [CORN_COMMON_RUST_ID],
        );

        // CORN: a linha "Rust_Blight" descrevia ferrugem polissora (Puccinia
        // polysora), que não é uma classe do modelo v2. A classe real "Blight"
        // do dataset é a Helmintosporiose (Northern Corn Leaf Blight,
        // Exserohilum turcicum) — troca completa de conteúdo, não é só rename.
        await queryRunner.query(
            `
            UPDATE "sickness" SET
                "name" = 'Blight',
                "description" = $2,
                "symptoms" = $3::text[],
                "temperature_min" = 18,
                "temperature_max" = 27,
                "temperature_optimal" = 23,
                "humidity_min" = 85,
                "humidity_max" = 100,
                "rainfall_dependency" = 'high',
                "favorable_seasons" = ARRAY['spring','summer']::text[],
                "updated_at" = CURRENT_TIMESTAMP
            WHERE "id" = $1
            `,
            [
                CORN_BLIGHT_ID,
                'Helmintosporiose (queima-das-folhas) do milho causada por Exserohilum turcicum (sin. Setosphaeria turcica). Uma das doenças foliares mais destrutivas da cultura em regiões de clima ameno e úmido, podendo causar perdas severas de produtividade quando a infecção ocorre antes do florescimento.',
                [
                    'Lesões alongadas e elípticas, em formato de cigarro, de coloração verde-acinzentada a palha, dispostas paralelamente às nervuras das folhas',
                    'Lesões de 2,5 a 15 cm de comprimento que podem coalescer formando grandes áreas de tecido foliar morto',
                    'Esporulação cinza-escura sobre as lesões em condições de alta umidade, dando aspecto "sujo" à folha',
                    'Progressão das lesões das folhas inferiores para as superiores ao longo do ciclo',
                    'Redução severa da área fotossintética e comprometimento do enchimento de grãos em infecções precoces e severas',
                ],
            ],
        );

        // WHEAT: a linha "Brown_Rust" já descreve a ferrugem da folha (Puccinia
        // triticina), que é exatamente a classe "Rust_Common" do modelo v2 —
        // só corrige o nome.
        await queryRunner.query(
            `UPDATE "sickness" SET "name" = 'Rust_Common', "updated_at" = CURRENT_TIMESTAMP WHERE "id" = $1`,
            [WHEAT_RUST_COMMON_ID],
        );

        // WHEAT: a linha "Yellow_Rust" descrevia ferrugem amarela (Puccinia
        // striiformis), que não é uma classe do modelo v2. A classe real
        // "Blight" do dataset é a Giberela (Fusarium Head Blight, Fusarium
        // graminearum) — troca completa de conteúdo, não é só rename.
        await queryRunner.query(
            `
            UPDATE "sickness" SET
                "name" = 'Blight',
                "description" = $2,
                "symptoms" = $3::text[],
                "temperature_min" = 15,
                "temperature_max" = 30,
                "temperature_optimal" = 25,
                "humidity_min" = 85,
                "humidity_max" = 100,
                "rainfall_dependency" = 'high',
                "favorable_seasons" = ARRAY['winter','spring']::text[],
                "updated_at" = CURRENT_TIMESTAMP
            WHERE "id" = $1
            `,
            [
                WHEAT_BLIGHT_ID,
                'Giberela (brusone da espiga) do trigo causada por Fusarium graminearum. Doença de espiga de grande importância econômica mundial, favorecida por clima quente e úmido durante o florescimento (antese), com impacto direto na qualidade e segurança do grão pela produção de micotoxinas.',
                [
                    'Branqueamento prematuro de espiguetas em meio a espigas ainda verdes e sadias',
                    'Crescimento fúngico rosado a alaranjado (esporodóquios) na base das espiguetas e glumas em condições de alta umidade',
                    'Grãos chochos, enrugados e de coloração clara ("grãos tombstone"), com peso e qualidade reduzidos',
                    'Contaminação dos grãos com micotoxinas (como desoxinivalenol - DON), comprometendo a segurança alimentar e o valor comercial',
                    'Infecção concentrada no período de florescimento, com pouca translocação para outras partes da planta',
                ],
            ],
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `UPDATE "sickness" SET "name" = 'Rust_Common', "updated_at" = CURRENT_TIMESTAMP WHERE "id" = $1`,
            [CORN_COMMON_RUST_ID],
        );

        await queryRunner.query(
            `
            UPDATE "sickness" SET
                "name" = 'Rust_Blight',
                "description" = $2,
                "symptoms" = $3::text[],
                "temperature_min" = 20,
                "temperature_max" = 32,
                "temperature_optimal" = 26,
                "humidity_min" = 70,
                "humidity_max" = 100,
                "rainfall_dependency" = 'medium',
                "favorable_seasons" = ARRAY['spring','summer','autumn']::text[],
                "updated_at" = CURRENT_TIMESTAMP
            WHERE "id" = $1
            `,
            [
                CORN_BLIGHT_ID,
                'Ferrugem polissora do milho causada por Puccinia polysora. Ocorre com maior frequência em regiões tropicais e subtropicais, podendo causar perdas significativas de produtividade em condições favoráveis.',
                [
                    'Pústulas ovais a circulares de coloração castanho-alaranjada na face abaxial das folhas',
                    'Clorose ao redor das lesões em infecções severas',
                    'Redução da área foliar fotossintética',
                    'Senescência precoce das folhas em casos graves',
                ],
            ],
        );

        await queryRunner.query(
            `UPDATE "sickness" SET "name" = 'Brown_Rust', "updated_at" = CURRENT_TIMESTAMP WHERE "id" = $1`,
            [WHEAT_RUST_COMMON_ID],
        );

        await queryRunner.query(
            `
            UPDATE "sickness" SET
                "name" = 'Yellow_Rust',
                "description" = $2,
                "symptoms" = $3::text[],
                "temperature_min" = 2,
                "temperature_max" = 20,
                "temperature_optimal" = 11,
                "humidity_min" = 70,
                "humidity_max" = 100,
                "rainfall_dependency" = 'medium',
                "favorable_seasons" = ARRAY['autumn','winter','spring']::text[],
                "updated_at" = CURRENT_TIMESTAMP
            WHERE "id" = $1
            `,
            [
                WHEAT_BLIGHT_ID,
                'Ferrugem amarela ou linear do trigo causada por Puccinia striiformis f. sp. tritici. Adapta-se a temperaturas mais baixas que as demais ferrugens e pode causar perdas totais de produção em epidemias severas.',
                [
                    'Pústulas amarelas dispostas em estrias ou listras paralelas às nervuras das folhas',
                    'Pó amarelo-alaranjado (urediósporos) sobre as listras nas condições de alta umidade',
                    'Clorose intensa e necrose das folhas em infecções severas',
                    'Esterilidade de espiguetas e grãos chochos em ataques no período de espigamento',
                ],
            ],
        );
    }
}
