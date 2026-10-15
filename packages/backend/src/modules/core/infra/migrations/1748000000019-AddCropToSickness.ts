import { MigrationInterface, QueryRunner } from 'typeorm';

// Nomes de classe se repetem entre culturas (ex.: 'Rust' no café e na soja),
// então a doença passa a ser identificada por (crop, name).
const CROP_BY_SICKNESS_ID: Record<string, string[]> = {
    CORN: [
        '11111111-0000-0000-0000-000000000001', // Rust_Blight
        '11111111-0000-0000-0000-000000000002', // Rust_Common
    ],
    WHEAT: [
        '11111111-0000-0000-0000-000000000003', // Brown_Rust
        '11111111-0000-0000-0000-000000000004', // Yellow_Rust
    ],
    SOYBEAN: [
        '11111111-0000-0000-0000-000000000005', // Rust (antes Soybean_Rust)
        '11111111-0000-0000-0000-000000000006', // Target_Spot
        '11111111-0000-0000-0000-000000000011', // Bacterial_Blight
    ],
    TOMATO: [
        '11111111-0000-0000-0000-000000000007', // Bacterial_Spot
        '11111111-0000-0000-0000-000000000008', // Leaf_Mold
    ],
    COFFEE: [
        '11111111-0000-0000-0000-000000000009', // Rust
        '11111111-0000-0000-0000-000000000010', // Phoma
    ],
};

const SOYBEAN_RUST_ID = '11111111-0000-0000-0000-000000000005';

export class AddCropToSickness1748000000019 implements MigrationInterface {
    name = 'AddCropToSickness1748000000019';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "sickness"
                ADD COLUMN IF NOT EXISTS "crop" VARCHAR(20) NULL
        `);

        for (const [crop, ids] of Object.entries(CROP_BY_SICKNESS_ID)) {
            await queryRunner.query(
                `UPDATE "sickness" SET "crop" = $1 WHERE "id" = ANY($2::uuid[])`,
                [crop, ids],
            );
        }

        // O modelo de soja retorna a classe 'Rust' (não 'Soybean_Rust').
        await queryRunner.query(
            `UPDATE "sickness" SET "name" = 'Rust' WHERE "id" = $1`,
            [SOYBEAN_RUST_ID],
        );

        await queryRunner.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS "UQ_sickness_crop_name"
                ON "sickness" ("crop", LOWER("name"))
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "UQ_sickness_crop_name"`);
        await queryRunner.query(
            `UPDATE "sickness" SET "name" = 'Soybean_Rust' WHERE "id" = $1`,
            [SOYBEAN_RUST_ID],
        );
        await queryRunner.query(`ALTER TABLE "sickness" DROP COLUMN IF EXISTS "crop"`);
    }
}
