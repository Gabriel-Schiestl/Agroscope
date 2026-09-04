import { MigrationInterface, QueryRunner } from 'typeorm';

export class NormalizeConfidenceValues1748000000014 implements MigrationInterface {
    name = 'NormalizeConfidenceValues1748000000014';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Registros com valor > 1 estavam na escala 0-100 (IA antiga).
        // Divide por 100 para uniformizar para 0-1 como o frontend espera.
        await queryRunner.query(`
            UPDATE "history"
            SET "crop_confidence" = "crop_confidence" / 100.0
            WHERE "crop_confidence" > 1
        `);

        await queryRunner.query(`
            UPDATE "history"
            SET "sickness_confidence" = "sickness_confidence" / 100.0
            WHERE "sickness_confidence" > 1
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE "history"
            SET "crop_confidence" = "crop_confidence" * 100.0
            WHERE "crop_confidence" <= 1 AND "crop_confidence" > 0
        `);

        await queryRunner.query(`
            UPDATE "history"
            SET "sickness_confidence" = "sickness_confidence" * 100.0
            WHERE "sickness_confidence" <= 1 AND "sickness_confidence" > 0
        `);
    }
}
