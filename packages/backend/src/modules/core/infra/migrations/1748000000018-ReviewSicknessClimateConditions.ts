import { MigrationInterface, QueryRunner } from 'typeorm';

const CORN_RUST_BLIGHT_ID = '11111111-0000-0000-0000-000000000001';
const CORN_RUST_COMMON_ID = '11111111-0000-0000-0000-000000000002';
const BROWN_RUST_ID = '11111111-0000-0000-0000-000000000003';
const YELLOW_RUST_ID = '11111111-0000-0000-0000-000000000004';
const SOYBEAN_RUST_ID = '11111111-0000-0000-0000-000000000005';
const TARGET_SPOT_ID = '11111111-0000-0000-0000-000000000006';
const BACTERIAL_SPOT_ID = '11111111-0000-0000-0000-000000000007';
const LEAF_MOLD_ID = '11111111-0000-0000-0000-000000000008';
const COFFEE_RUST_ID = '11111111-0000-0000-0000-000000000009';
const PHOMA_ID = '11111111-0000-0000-0000-000000000010';
const BACTERIAL_BLIGHT_ID = '11111111-0000-0000-0000-000000000011';

interface Climate {
    id: string;
    tMin: number;
    tMax: number;
    tOpt: number;
    hMin: number;
    hMax: number;
    rain: 'low' | 'medium' | 'high';
    seasons: string[];
}

// Valores aplicados no up().
const NEW_CLIMATE: Climate[] = [
    // Puccinia polysora: 20-32°C, ótimo ~27°C
    { id: CORN_RUST_BLIGHT_ID, tMin: 20, tMax: 32, tOpt: 26, hMin: 70, hMax: 100, rain: 'medium', seasons: ['spring', 'summer', 'autumn'] },
    // Puccinia sorghi: 14-27°C, ótimo ~20°C
    { id: CORN_RUST_COMMON_ID, tMin: 14, tMax: 27, tOpt: 20, hMin: 65, hMax: 100, rain: 'medium', seasons: ['spring', 'summer', 'autumn'] },
    // Puccinia triticina: 10-28°C, ótimo 15-22°C; trigo de inverno no Brasil
    { id: BROWN_RUST_ID, tMin: 10, tMax: 28, tOpt: 20, hMin: 65, hMax: 100, rain: 'medium', seasons: ['autumn', 'winter', 'spring'] },
    // P. striiformis: 2-20°C, ótimo 8-13°C; orvalho basta (menos dependente de chuva)
    { id: YELLOW_RUST_ID, tMin: 2, tMax: 20, tOpt: 11, hMin: 70, hMax: 100, rain: 'medium', seasons: ['autumn', 'winter', 'spring'] },
    // Phakopsora pachyrhizi: 15-28°C, ótimo 20-25°C; ciclo da soja inclui o outono
    { id: SOYBEAN_RUST_ID, tMin: 15, tMax: 28, tOpt: 22, hMin: 65, hMax: 100, rain: 'medium', seasons: ['spring', 'summer', 'autumn'] },
    // Corynespora cassiicola: 20-32°C, ótimo 25-28°C
    { id: TARGET_SPOT_ID, tMin: 20, tMax: 32, tOpt: 26, hMin: 65, hMax: 100, rain: 'medium', seasons: ['spring', 'summer', 'autumn'] },
    // Xanthomonas spp.: 20-33°C (X. perforans tolera calor), ótimo 25-30°C
    { id: BACTERIAL_SPOT_ID, tMin: 20, tMax: 33, tOpt: 28, hMin: 65, hMax: 100, rain: 'high', seasons: ['spring', 'summer'] },
    // Passalora fulva: 15-28°C, ótimo 22-24°C; depende de UR alta (estufas) mais que de chuva
    { id: LEAF_MOLD_ID, tMin: 15, tMax: 28, tOpt: 22, hMin: 75, hMax: 100, rain: 'medium', seasons: ['autumn', 'winter', 'spring'] },
    // Hemileia vastatrix: 16-28°C, ótimo 21-25°C; epidemia sobe da primavera ao outono
    { id: COFFEE_RUST_ID, tMin: 16, tMax: 28, tOpt: 23, hMin: 65, hMax: 100, rain: 'high', seasons: ['spring', 'summer', 'autumn'] },
    // Phoma spp.: 10-20°C, ótimo ~16°C; frio + vento + umidade, inclusive na florada (set-out)
    { id: PHOMA_ID, tMin: 10, tMax: 20, tOpt: 16, hMin: 70, hMax: 100, rain: 'medium', seasons: ['autumn', 'winter', 'spring'] },
];

// Valores anteriores, restaurados no down().
const OLD_CLIMATE: Climate[] = [
    { id: CORN_RUST_BLIGHT_ID, tMin: 22, tMax: 30, tOpt: 26, hMin: 80, hMax: 100, rain: 'medium', seasons: ['spring', 'summer'] },
    { id: CORN_RUST_COMMON_ID, tMin: 15, tMax: 25, tOpt: 20, hMin: 75, hMax: 100, rain: 'medium', seasons: ['spring', 'autumn'] },
    { id: BROWN_RUST_ID, tMin: 15, tMax: 22, tOpt: 18, hMin: 80, hMax: 100, rain: 'medium', seasons: ['spring', 'autumn'] },
    { id: YELLOW_RUST_ID, tMin: 7, tMax: 15, tOpt: 10, hMin: 85, hMax: 100, rain: 'high', seasons: ['winter', 'spring'] },
    { id: SOYBEAN_RUST_ID, tMin: 18, tMax: 28, tOpt: 22, hMin: 80, hMax: 100, rain: 'medium', seasons: ['spring', 'summer'] },
    { id: TARGET_SPOT_ID, tMin: 20, tMax: 30, tOpt: 25, hMin: 78, hMax: 100, rain: 'medium', seasons: ['summer'] },
    { id: BACTERIAL_SPOT_ID, tMin: 24, tMax: 32, tOpt: 28, hMin: 80, hMax: 100, rain: 'high', seasons: ['summer'] },
    { id: LEAF_MOLD_ID, tMin: 18, tMax: 26, tOpt: 22, hMin: 85, hMax: 100, rain: 'medium', seasons: ['autumn', 'winter'] },
    { id: COFFEE_RUST_ID, tMin: 21, tMax: 25, tOpt: 23, hMin: 80, hMax: 100, rain: 'high', seasons: ['spring', 'summer'] },
    { id: PHOMA_ID, tMin: 10, tMax: 18, tOpt: 14, hMin: 85, hMax: 100, rain: 'medium', seasons: ['winter'] },
];

export class ReviewSicknessClimateConditions1748000000018
    implements MigrationInterface
{
    name = 'ReviewSicknessClimateConditions1748000000018';

    private async applyClimate(
        queryRunner: QueryRunner,
        rows: Climate[],
    ): Promise<void> {
        for (const c of rows) {
            await queryRunner.query(
                `
                UPDATE "sickness" SET
                    "temperature_min" = $2,
                    "temperature_max" = $3,
                    "temperature_optimal" = $4,
                    "humidity_min" = $5,
                    "humidity_max" = $6,
                    "rainfall_dependency" = $7,
                    "favorable_seasons" = $8::text[],
                    "updated_at" = CURRENT_TIMESTAMP
                WHERE "id" = $1
                `,
                [c.id, c.tMin, c.tMax, c.tOpt, c.hMin, c.hMax, c.rain, c.seasons],
            );
        }
    }

    public async up(queryRunner: QueryRunner): Promise<void> {
        await this.applyClimate(queryRunner, NEW_CLIMATE);

        // Soybean — Crestamento Bacteriano (Bacterial Blight) — Pseudomonas savastanoi pv. glycinea
        // Classe "Bacterial_Blight" do modelo de soja.
        await queryRunner.query(`
            INSERT INTO "sickness" (
                "id", "name", "description", "symptoms",
                "temperature_min", "temperature_max", "temperature_optimal",
                "humidity_min", "humidity_max",
                "rainfall_dependency", "favorable_seasons"
            ) VALUES (
                '${BACTERIAL_BLIGHT_ID}',
                'Bacterial_Blight',
                'Crestamento bacteriano da soja causado por Pseudomonas savastanoi pv. glycinea (sin. P. syringae pv. glycinea). Ocorre principalmente no início do ciclo, sob temperaturas amenas e períodos de chuva com vento, que disseminam a bactéria e abrem ferimentos nas folhas. Tempo quente e seco interrompe o avanço da doença.',
                ARRAY[
                    'Pequenas manchas angulares encharcadas na face inferior das folhas, que passam a marrom-escuro',
                    'Halo amarelo-esverdeado ao redor das lesões, visível contra a luz',
                    'Coalescência das manchas formando áreas necróticas que rasgam o limbo foliar',
                    'Lesões em pecíolos, hastes e vagens em ataques severos',
                    'Desfolha e queda de vigor em lavouras com infecção precoce'
                ],
                15, 28, 24,
                65, 100,
                'high',
                ARRAY['spring', 'autumn']
            ) ON CONFLICT ("id") DO NOTHING
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DELETE FROM "sickness" WHERE "id" = '${BACTERIAL_BLIGHT_ID}'`,
        );
        await this.applyClimate(queryRunner, OLD_CLIMATE);
    }
}
