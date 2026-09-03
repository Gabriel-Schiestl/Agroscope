import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSicknessIdToHistory1746770000000 implements MigrationInterface {
    name = 'AddSicknessIdToHistory1746770000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "history"
            ADD COLUMN IF NOT EXISTS "sickness_id" uuid NULL
        `);

        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint WHERE conname = 'FK_history_sickness'
                ) AND NOT EXISTS (
                    SELECT 1 FROM pg_constraint
                    WHERE conrelid = '"history"'::regclass
                    AND confrelid = '"sickness"'::regclass
                    AND contype = 'f'
                ) THEN
                    ALTER TABLE "history"
                    ADD CONSTRAINT "FK_history_sickness"
                    FOREIGN KEY ("sickness_id") REFERENCES "sickness"("id")
                    ON DELETE SET NULL;
                END IF;
            END $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "history"
            DROP CONSTRAINT IF EXISTS "FK_history_sickness"
        `);

        await queryRunner.query(`
            ALTER TABLE "history" DROP COLUMN IF EXISTS "sickness_id"
        `);
    }
}
